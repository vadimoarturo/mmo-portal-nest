import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopBuyDTO } from './dto/shop-buy.dto';
import { ShopCategoryGetDTO } from './dto/shop-category.dto';
import { ShopItemsDTO } from './dto/shop-items.dto';
import { ShopItemsGetDTO } from './dto/shop-items.dto';
import { AuthJwtPayloadDTO } from '#Auth/dto/auth-jwt-payload.dto';
import { AuthUser } from '#Common/decorator/auth-user.decorator';
import { AuthAccessGuard } from '#Auth/guard/auth-access.guard';

@Controller('shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) {}

    @Get('category')
    async getShopCategory(): Promise<ShopCategoryGetDTO> {
        return await this.shopService.getShopCategory();
    }

    @Post('items')
    @HttpCode(200)
    async getShopItems(@Body() data: ShopItemsGetDTO): Promise<ShopItemsDTO> {
        return await this.shopService.getShopItems(data);
    }

    @UseGuards(AuthAccessGuard)
    @Post('buy')
    @HttpCode(200)
    async buyShopItem(@Body() data: ShopBuyDTO, @AuthUser() { login }: AuthJwtPayloadDTO): Promise<boolean> {
        return await this.shopService.buyShopItem({
            ...data,
            login: login,
        });
    }
}
