import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentation/http/auth.controller';
import { AuthValidateLocalStrategy } from './presentation/http/strategie/auth-validate-local.strategy';
import { AuthService } from './application/auth.service';
import { UserService } from './application/user.service';
import { JwtTokenService } from './infrastructure/jwt-token.service';
import { PrismaIdentityRepository } from './infrastructure/prisma-identity.repository';
import { BcryptCredentials } from './infrastructure/bcrypt-credentials';
import { QueuedIdentityNotifications } from './infrastructure/identity-notifications';
import { AccountQueries } from './infrastructure/account-queries';
@Module({
    imports: [JwtModule.register({})],
    controllers: [AuthController],
    exports: [JwtTokenService, UserService],
    providers: [
        JwtTokenService,
        PrismaIdentityRepository,
        BcryptCredentials,
        QueuedIdentityNotifications,
        AccountQueries,
        AuthValidateLocalStrategy,
        {
            provide: AuthService,
            inject: [JwtTokenService, PrismaIdentityRepository, QueuedIdentityNotifications, BcryptCredentials],
            useFactory: (tokens: JwtTokenService, accounts: PrismaIdentityRepository, notifications: QueuedIdentityNotifications, credentials: BcryptCredentials) =>
                new AuthService(tokens, accounts, notifications, credentials),
        },
        { provide: UserService, inject: [AccountQueries], useFactory: (queries: AccountQueries) => new UserService(queries) },
    ],
})
export class IdentityModule {}
