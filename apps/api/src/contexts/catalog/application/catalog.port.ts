import { GameServerName } from '#Root/shared/domain/enum/index';
import { TransactionContext } from '#Root/shared/application/transaction';
import { Product } from '../domain/product';
import { ShopCategoryGetDTO } from './contracts/shop-category.dto';
import { ShopItemsDTO, ShopItemsGetDTO } from './contracts/shop-items.dto';
export interface PurchaseRecord {
    login: string;
    server_name: GameServerName;
    item_id: number;
    item_count: number;
    count: number;
    game_item_id: string;
    item_price: string;
    item_total_price: string;
    current_balance: string;
    updated_balance: string;
}
export interface CatalogRepository {
    availableProduct(id: number, server: GameServerName, context: TransactionContext): Promise<Product | null>;
    recordPurchase(record: PurchaseRecord, context: TransactionContext): Promise<void>;
}
export interface CatalogReadPort {
    getShopCategory(): Promise<ShopCategoryGetDTO>;
    getShopItems(query: ShopItemsGetDTO): Promise<ShopItemsDTO>;
}
