import { PaymentOrder, PaymentQuote, BonusPolicy } from './payment-order';
import { PayProviders, PayStatus } from '#Root/shared/domain/enum/index';
describe('Payment order rules', () => {
    const receipt = { orderId: '1', amount: '10', currency: 'USD', provider: PayProviders.ANYPAY };
    const data = { id: '1', login: 'player', amount: '10.00', rate: '70', currency: 'USD', provider: PayProviders.ANYPAY, status: PayStatus.NEW };
    it('acknowledges a settled receipt idempotently', () => expect(new PaymentOrder({ ...data, status: PayStatus.SUCCESS }).accept(receipt)).toBe('already-settled'));
    it('validates amount even for a repeated receipt', () => expect(() => new PaymentOrder({ ...data, status: PayStatus.SUCCESS }).accept({ ...receipt, amount: '1' })).toThrow());
    it('uses the largest eligible threshold independent of input ordering', () =>
        expect(
            BonusPolicy.total('1', '100', [
                { amount: '90', percent: '10' },
                { amount: '10', percent: '5' },
            ]),
        ).toBe('110.00'));
    it('rejects a quote that would round down to a zero provider charge', () => expect(() => PaymentQuote.create('0.01', '1000', '0')).toThrow());
});
