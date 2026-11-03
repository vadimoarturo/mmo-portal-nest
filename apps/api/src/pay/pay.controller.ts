import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PayService } from './pay.service';
import { PayListDTO } from './dto/pay-list.dto';
import { PayCreateRequestDTO, PayCreateResponseDTO } from './dto/pay-create.dto';
import { AuthUser } from '#Common/decorator/auth-user.decorator';
import { AuthJwtPayloadDTO } from '#Auth/dto/auth-jwt-payload.dto';
import { AuthAccessGuard } from '#Auth/guard/auth-access.guard';

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
