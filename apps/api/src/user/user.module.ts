import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BalanceService } from './balance.service';

@Module({
    providers: [UserService, BalanceService],
    controllers: [UserController],
    exports: [UserService, BalanceService],
})
export class UserModule {}
