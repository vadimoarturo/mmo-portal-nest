import { IsBoolean, IsNumber, IsString, IsInt, IsArray, ValidateNested, IsEnum, IsNumberString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { GameServerName } from '#Root/shared/domain/enum/index';
import { ShopItemLifeType } from '#Root/shared/domain/enum/shop-item-life-type.enum';

export class ShopItemsGetDTO {
    @IsString()
    readonly categoryId: string;

    @IsNumber()
    readonly page: number;

    @IsEnum(GameServerName)
    readonly serverName: GameServerName;
}

export class ShopItemDTO {
    @IsNumber()
    readonly itemId: number;

    @IsString()
    readonly icon: string;

    @IsString()
    readonly image: string;

    @IsString()
    readonly info: string;

    @IsString()
    @IsOptional()
    readonly level?: string;

    @IsString()
    readonly categoryId: string;

    @IsString()
    readonly price: string;

    @IsString()
    readonly sale: string;

    @IsInt()
    readonly itemCount: number;

    @IsBoolean()
    readonly isStack: boolean;

    @IsNumberString()
    @IsOptional()
    readonly lifeTime?: string;

    @IsEnum(ShopItemLifeType)
    readonly lifeType: ShopItemLifeType;

    @IsBoolean()
    readonly isMove: boolean;
}

export class ShopItemsDTO {
    @Type(() => ShopItemDTO)
    @ValidateNested({ each: true })
    @IsArray()
    readonly data: ShopItemDTO[];

    @IsInt()
    readonly totalPages: number;

    @IsInt()
    readonly currentPage: number;
}
