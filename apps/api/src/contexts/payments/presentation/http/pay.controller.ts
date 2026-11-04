import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PayService } from '#Root/contexts/payments/application/pay.service';
import { PayListDTO } from '#Root/contexts/payments/presentation/http/dto/pay-list.dto';
import { PayCreateRequestDTO, PayCreateResponseDTO } from '#Root/contexts/payments/presentation/http/dto/pay-create.dto';
import { AuthUser } from '#Root/shared/decorator/auth-user.decorator';
import { AuthJwtPayloadDTO } from '#Root/contexts/identity/presentation/http/dto/auth-jwt-payload.dto';
import { AuthAccessGuard } from '#Root/contexts/identity/presentation/http/guard/auth-access.guard';

@UseGuards(AuthAccessGuard)
@Controller('pay')
export class PayController {
    constructor(private readonly payService: PayService) {}

    @Get('list')
    async list(): Promise<PayListDTO[]> {
        return this.payService.payList();
    }

    @Post('create')
    async create(@Body() data: PayCreateRequestDTO, @AuthUser() { login }: AuthJwtPayloadDTO): Promise<PayCreateResponseDTO> {
        return await this.payService.payCreate({
            ...data,
            login: login,
        });
    }
}
