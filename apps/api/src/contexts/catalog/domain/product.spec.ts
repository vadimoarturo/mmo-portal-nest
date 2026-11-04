import { Product } from './product';
describe('Product purchase rules', () => {
    const data = { id: 1, price: '10', sale: '7.50', stackable: true, bundleSize: 2, gameItemId: 5, gameItemSetId: '', isSet: false };
    it('prices bundles using the sale price', () => {
        const quote = new Product(data).quote(3);
        expect(quote.total.toFixed()).toBe('22.50');
        expect(quote.deliveryCount).toBe(6);
    });
    it('limits non-stackable products to one purchase', () => expect(() => new Product({ ...data, stackable: false }).quote(2)).toThrow());
    it('rejects corrupt bundle sizes before charging the wallet', () => expect(() => new Product({ ...data, bundleSize: 0 }).quote(1)).toThrow());
});
