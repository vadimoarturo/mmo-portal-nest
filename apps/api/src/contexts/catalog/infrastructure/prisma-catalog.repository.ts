import { Injectable } from '@nestjs/common';
import { CatalogRepository, PurchaseRecord } from '../application/catalog.port';
import { Product } from '../domain/product';
import { GameServerName } from '#Root/shared/domain/enum/index';
import { TransactionContext } from '#Root/shared/application/transaction';
import { transactionClient } from '#Root/platform/prisma/unit-of-work';
@Injectable()
export class PrismaCatalogRepository implements CatalogRepository {
    async availableProduct(id: number, server: GameServerName, context: TransactionContext) {
        const item = await transactionClient(context).shopItem.findFirst({
            where: { item_id: id, server_name: server, is_active: true, game_server: { is_active: true }, shop_category: { is_active: true } },
        });
        return item
            ? new Product({
                  id: item.item_id,
                  price: item.price,
                  sale: item.sale,
                  stackable: item.is_stack,
                  bundleSize: item.item_count,
                  gameItemId: item.game_id,
                  gameItemSetId: item.game_id_set,
                  isSet: item.is_set,
              })
            : null;
    }
    async recordPurchase(record: PurchaseRecord, context: TransactionContext) {
        await transactionClient(context).historyBuy.create({ data: record });
    }
}
