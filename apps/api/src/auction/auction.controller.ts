import { Body, Controller, Post, UseGuards, HttpCode } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuthUser } from '#Common/decorator/auth-user.decorator';
import { AuthJwtPayloadDTO } from '#Auth/dto/auth-jwt-payload.dto';
import { AuctionBuyLotDTO, AuctionCancelLotDTO, AuctionCreateLotDTO, AuctionLotsDTO, AuctionLotsGetDTO } from './dto/auction.dto';
import { AuthAccessGuard } from '#Auth/guard/auth-access.guard';

@Controller('auction')
export class AuctionController {
    constructor(private readonly auctionService: AuctionService) {}

    @UseGuards(AuthAccessGuard)
    @Post('create')
    async create(@Body() data: AuctionCreateLotDTO, @AuthUser() { login }: AuthJwtPayloadDTO): Promise<boolean> {
        return await this.auctionService.createLot(
            {
                ...data,
            },
            login,
        );
    }

    @UseGuards(AuthAccessGuard)
    @Post('buy')
    async buyLot(@Body() data: AuctionBuyLotDTO, @AuthUser() { login }: AuthJwtPayloadDTO): Promise<boolean> {
        return await this.auctionService.buyLot(data, login);
    }

    @Post('lots')
    @HttpCode(200)
    async getLots(@Body() data: AuctionLotsGetDTO): Promise<AuctionLotsDTO> {
        return await this.auctionService.getLots(data);
    }

    @UseGuards(AuthAccessGuard)
    @Post('lots/my')
    @HttpCode(200)
    async getMyLots(@Body() data: AuctionLotsGetDTO, @AuthUser() { login }: AuthJwtPayloadDTO): Promise<AuctionLotsDTO> {
        return await this.auctionService.getMyLots(data, login);
    }

    @UseGuards(AuthAccessGuard)
    @Post('cancel')
    async cancelLot(@Body() data: AuctionCancelLotDTO, @AuthUser() { login }: AuthJwtPayloadDTO): Promise<boolean> {
        return await this.auctionService.cancelLot(data, login);
    }
}
