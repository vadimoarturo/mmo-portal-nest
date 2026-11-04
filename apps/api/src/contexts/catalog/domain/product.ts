import { Money } from '#Root/shared/domain/money';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/index';
export interface ProductSnapshot {
    id: number;
    price: string;
    sale: string;
    stackable: boolean;
    bundleSize: number;
    gameItemId: number;
    gameItemSetId: string;
    isSet: boolean;
}
export class Product {
    constructor(readonly data: Readonly<ProductSnapshot>) {}
    static validateQuantity(count: number) {
        if (!Number.isSafeInteger(count) || count < 1 || count > 1000) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.SHOP_BUY_LIMIT_COUNT });
        }
    }
    quote(count: number) {
        Product.validateQuantity(count);
        if (!this.data.stackable && count > 1) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.SHOP_BUY_LIMIT_COUNT });
        }
        const unitPrice = Money.parse(this.data.sale || this.data.price);
        const deliveryCount = count * this.data.bundleSize;
        if (!Number.isSafeInteger(deliveryCount) || deliveryCount < 1) {
            throw new Error('Invalid product delivery quantity');
        }
        return { unitPrice, total: unitPrice.multiply(count), deliveryCount };
    }
}
