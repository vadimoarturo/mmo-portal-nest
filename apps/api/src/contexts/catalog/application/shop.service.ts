import { CatalogRepository, CatalogReadPort } from './catalog.port';
import { AccountsPort } from '#Root/contexts/identity/application/accounts.port';
import { WalletPort } from '#Root/contexts/wallet/application/wallet.port';
import { GamePort } from '#Root/contexts/game-integration/application/game.port';
import { UnitOfWork } from '#Root/shared/application/transaction';
import { Money } from '#Root/shared/domain/money';
import { Product } from '../domain/product';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/index';
import { IBuyShopItem } from './type';
import { ShopItemsGetDTO } from './contracts/shop-items.dto';
export class ShopService {
    static readonly cacheKeys = 'shop';
    constructor(
        private readonly repository: CatalogRepository,
        private readonly queries: CatalogReadPort,
        private readonly accounts: AccountsPort,
        private readonly wallet: WalletPort,
        private readonly game: GamePort,
        private readonly uow: UnitOfWork,
    ) {}
    async buyShopItem({ login, itemId, count, serverName }: IBuyShopItem) {
        Product.validateQuantity(count);
        const { account_id: accountId } = await this.accounts.checkUser(login);
        return this.uow.run(async (context) => {
            const product = await this.repository.availableProduct(itemId, serverName, context);
            if (!product) {
                throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.SHOP_NOT_FOUND_ITEM });
            }
            const quote = product.quote(count);
            const balance = await this.wallet.decrement(login, quote.total.toFixed(), context);
            await this.repository.recordPurchase(
                {
                    login,
                    server_name: serverName,
                    item_id: itemId,
                    item_count: product.data.bundleSize,
                    count,
                    game_item_id: product.data.isSet ? product.data.gameItemSetId : String(product.data.gameItemId),
                    item_price: quote.unitPrice.toFixed(),
                    item_total_price: quote.total.toFixed(),
                    current_balance: Money.balance(balance).plus(quote.total).toFixed(),
                    updated_balance: balance,
                },
                context,
            );
            await this.game.deliver(
                serverName,
                { accountId, gameItemId: product.data.gameItemId, gameItemSetId: product.data.gameItemSetId, isSet: product.data.isSet, count: quote.deliveryCount },
                context,
            );
            return true;
        });
    }
    getShopCategory() {
        return this.queries.getShopCategory();
    }
    getShopItems(query: ShopItemsGetDTO) {
        return this.queries.getShopItems(query);
    }
}
