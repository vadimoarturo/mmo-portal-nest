import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '#Root/platform/prisma/prisma.service';
import { TransactionContext } from '#Root/shared/application/transaction';
import { transactionClient } from '#Root/platform/prisma/unit-of-work';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/index';
@Injectable()
export class PrismaWalletRepository {
    constructor(private readonly prisma: PrismaService) {}

    async credit(login: string, amount: string, method: 'pay' | 'auction' | 'refund', context: TransactionContext) {
        const value = amount;
        const apply = async (tx: Prisma.TransactionClient) => {
            const rows = await tx.$queryRaw<{ current_balance: string; previous_balance: string }[]>`
                UPDATE [users]
                SET current_balance = CAST(current_balance AS DECIMAL(19, 2)) + CAST(${value} AS DECIMAL(19, 2)),
                    balance = CAST(balance AS DECIMAL(19, 2)) + CAST(${value} AS DECIMAL(19, 2))
                OUTPUT deleted.current_balance AS previous_balance, inserted.current_balance
                WHERE login = ${login}
            `;
            if (rows.length !== 1) {
                throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.USER_NOT_FOUND });
            }
            await tx.historyTopUp.create({
                data: {
                    login,
                    current_balance: rows[0].previous_balance,
                    updated_balance: rows[0].current_balance,
                    method,
                },
            });
            return rows[0].current_balance;
        };
        return apply(transactionClient(context));
    }

    async debit(login: string, amount: string, context: TransactionContext) {
        const value = amount;
        const apply = async (tx: Prisma.TransactionClient) => {
            const rows = await tx.$queryRaw<{ current_balance: string }[]>`
                UPDATE [users]
                SET current_balance = CAST(current_balance AS DECIMAL(19, 2)) - CAST(${value} AS DECIMAL(19, 2))
                OUTPUT inserted.current_balance
                WHERE login = ${login}
                  AND CAST(current_balance AS DECIMAL(19, 2)) >= CAST(${value} AS DECIMAL(19, 2))
            `;
            if (rows.length !== 1) {
                throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.USER_INSUFFICIENT_FUNDS });
            }
            return rows[0].current_balance;
        };
        return apply(transactionClient(context));
    }

    async balance(login: string): Promise<string> {
        const user = await this.prisma.user.findUnique({ where: { login }, select: { current_balance: true } });
        if (!user) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.USER_NOT_FOUND });
        }
        return user.current_balance;
    }
}
