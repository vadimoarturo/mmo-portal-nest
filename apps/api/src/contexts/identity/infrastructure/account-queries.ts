import { Injectable } from '@nestjs/common';
import { PrismaService } from '#Root/platform/prisma/prisma.service';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/error-code.enum';

@Injectable()
export class AccountQueries {
    constructor(private readonly prisma: PrismaService) {}

    public async checkUser(login: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                login: login,
            },
            select: {
                email_verify: true,
                login: true,
                account_id: true,
                current_balance: true,
            },
        });
        if (!user) {
            throw new DomainError({
                type: 'CLIENT',
                code: ErrorCodeClient.USER_NOT_FOUND,
            });
        }
        return user;
    }
}
