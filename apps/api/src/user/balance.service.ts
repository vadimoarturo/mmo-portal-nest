import { ErrorCodeClient } from '#Common/enum';
import { ApiError } from '#Common/exception/error.exception';
import { PrismaService } from '#Core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function money(value: string): Prisma.Decimal {
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.MIN_AMOUNT });
    }
    const amount = new Prisma.Decimal(value);
    if (!amount.greaterThan(0) || amount.greaterThan('9000000000')) {
        throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.MIN_AMOUNT });
    }
    return amount;
}

@Injectable()
export class BalanceService {
    constructor(private readonly prisma: PrismaService) {}

    async increment(login: string, amount: string, method: 'pay' | 'auction' | 'refund', transaction?: Prisma.TransactionClient) {
        const value = money(amount).toFixed(2);
        const apply = async (tx: Prisma.TransactionClient) => {
            const rows = await tx.$queryRaw<{ current_balance: string; previous_balance: string }[]>`
                UPDATE [users]
                SET current_balance = CAST(current_balance AS DECIMAL(19, 2)) + CAST(${value} AS DECIMAL(19, 2)),
                    balance = CAST(balance AS DECIMAL(19, 2)) + CAST(${value} AS DECIMAL(19, 2))
                OUTPUT deleted.current_balance AS previous_balance, inserted.current_balance
                WHERE login = ${login}
            `;
            if (rows.length !== 1) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.USER_NOT_FOUND });
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
        return transaction ? apply(transaction) : this.prisma.$transaction(apply);
    }

    async decrement(login: string, amount: string, transaction?: Prisma.TransactionClient) {
        const value = money(amount).toFixed(2);
        const apply = async (tx: Prisma.TransactionClient) => {
            const rows = await tx.$queryRaw<{ current_balance: string }[]>`
                UPDATE [users]
                SET current_balance = CAST(current_balance AS DECIMAL(19, 2)) - CAST(${value} AS DECIMAL(19, 2))
                OUTPUT inserted.current_balance
                WHERE login = ${login}
                  AND CAST(current_balance AS DECIMAL(19, 2)) >= CAST(${value} AS DECIMAL(19, 2))
            `;
            if (rows.length !== 1) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.USER_INSUFFICIENT_FUNDS });
            }
            return rows[0].current_balance;
        };
        return transaction ? apply(transaction) : this.prisma.$transaction(apply);
    }

    async checkBalance(login: string, amount: string): Promise<boolean> {
        const balance = await this.getBalance(login);
        if (new Prisma.Decimal(balance).lessThan(money(amount))) {
            throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.USER_INSUFFICIENT_FUNDS });
        }
        return true;
    }

    async getBalance(login: string): Promise<string> {
        const user = await this.prisma.user.findUnique({ where: { login }, select: { current_balance: true } });
        if (!user) {
            throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.USER_NOT_FOUND });
        }
        return user.current_balance;
    }
}
