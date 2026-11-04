import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ShopService } from '#Root/contexts/catalog/application/shop.service';
import { ShopBuyDTO } from '#Root/contexts/catalog/presentation/http/dto/shop-buy.dto';
import { ShopCategoryGetDTO } from '#Root/contexts/catalog/presentation/http/dto/shop-category.dto';
import { ShopItemsDTO } from '#Root/contexts/catalog/presentation/http/dto/shop-items.dto';
import { ShopItemsGetDTO } from '#Root/contexts/catalog/presentation/http/dto/shop-items.dto';
import { AuthJwtPayloadDTO } from '#Root/contexts/identity/presentation/http/dto/auth-jwt-payload.dto';
import { AuthUser } from '#Root/shared/decorator/auth-user.decorator';
import { AuthAccessGuard } from '#Root/contexts/identity/presentation/http/guard/auth-access.guard';

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
