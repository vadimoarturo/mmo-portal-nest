import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthJwtPayloadDTO } from '#Auth/dto/auth-jwt-payload.dto';
import { AuthUser } from '#Common/decorator/auth-user.decorator';
import { AuthAccessGuard } from '#Auth/guard/auth-access.guard';
import { BalanceService } from './balance.service';

@Controller('user')
export class UserController {
    constructor(private readonly balanceService: BalanceService) {}

    @UseGuards(AuthAccessGuard)
    @Get('balance')
    async getBalance(@AuthUser() { login }: AuthJwtPayloadDTO): Promise<string> {
        return await this.balanceService.getBalance(login);
    }
}
