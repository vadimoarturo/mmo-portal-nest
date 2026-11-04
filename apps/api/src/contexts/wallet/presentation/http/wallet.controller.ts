import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthJwtPayloadDTO } from '#Root/contexts/identity/presentation/http/dto/auth-jwt-payload.dto';
import { AuthUser } from '#Root/shared/decorator/auth-user.decorator';
import { AuthAccessGuard } from '#Root/contexts/identity/presentation/http/guard/auth-access.guard';
import { BalanceService } from '#Root/contexts/wallet/application/balance.service';

@Controller('user')
export class WalletController {
    constructor(private readonly balanceService: BalanceService) {}

    @UseGuards(AuthAccessGuard)
    @Get('balance')
    async getBalance(@AuthUser() { login }: AuthJwtPayloadDTO): Promise<string> {
        return await this.balanceService.getBalance(login);
    }
}
