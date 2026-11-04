import { GameServerName } from '#Root/shared/domain/enum/index';
import { ShopItemLifeType } from '#Root/shared/domain/enum/shop-item-life-type.enum';

export interface ShopItemsGetDTO {
    readonly categoryId: string;

    readonly page: number;

    readonly serverName: GameServerName;
}

export interface ShopItemDTO {
    readonly itemId: number;

    readonly icon: string;

    readonly image: string;

    readonly info: string;

    readonly level?: string;

    readonly categoryId: string;

    readonly price: string;

    readonly sale: string;

    readonly itemCount: number;

    readonly isStack: boolean;

    readonly lifeTime?: string;

    readonly lifeType: ShopItemLifeType;

    readonly isMove: boolean;
}

export interface ShopItemsDTO {
    readonly data: ShopItemDTO[];

    readonly totalPages: number;

    readonly currentPage: number;
}
