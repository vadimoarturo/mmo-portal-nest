import { Injectable } from '@nestjs/common';
import { PrismaService } from '#Core/prisma/prisma.service';
import { ApiError } from '#Common/exception/error.exception';
import { ErrorCodeClient } from '#Common/enum/error-code.enum';
import { BalanceService } from './balance.service';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly balanceService: BalanceService,
    ) {}

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
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.USER_NOT_FOUND,
            });
        }
        return user;
    }
}
