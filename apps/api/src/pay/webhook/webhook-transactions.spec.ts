import { WebhookService } from './webhook.service';
import { PayProviders } from '#Common/enum';
import { PayStatus } from '#Common/enum/pay-status.enum';
import { AnyPayDTO } from '#Pay/providers/AnyPay/dto';

function fixture() {
    const order = { id: '1', login: 'player', provider: PayProviders.ANYPAY, currency: 'USD', amount: '10.00', rate: '70', status: PayStatus.NEW };
    const tx = {
        orderTransaction: { findUnique: jest.fn().mockResolvedValue(order), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        payProvider: { findUnique: jest.fn().mockResolvedValue({ bonus: [] }) },
    };
    const prisma = { $transaction: jest.fn((fn) => fn(tx)) };
    const balance = { increment: jest.fn() };
    const service = new WebhookService(balance as never, prisma as never);
    const callback = { pay_id: '1', amount: '10.00', currency: 'USD', status: 'paid', test: '0', transaction_id: 'invoice-1' } as AnyPayDTO;
    return { service, tx, balance, order, callback };
}

describe('Payment settlement', () => {
    it('commits the order and credit increment in the same transaction', async () => {
        const { service, callback, tx, balance } = fixture();
        await expect(service.anypay(callback)).resolves.toBe(true);
        expect(balance.increment).toHaveBeenCalledWith('player', '700.00', 'pay', tx);
    });
    it('acknowledges a repeated callback without crediting twice', async () => {
        const { service, callback, order, balance } = fixture();
        order.status = PayStatus.SUCCESS;
        await expect(service.anypay(callback)).resolves.toBe(true);
        expect(balance.increment).not.toHaveBeenCalled();
    });
    it('does not credit a concurrent callback that lost the conditional claim', async () => {
        const { service, callback, tx, balance } = fixture();
        tx.orderTransaction.updateMany.mockResolvedValue({ count: 0 });
        await service.anypay(callback);
        expect(balance.increment).not.toHaveBeenCalled();
    });
    it.each([{ amount: '0.01' }, { currency: 'EUR' }])('rejects callbacks that do not match the order: %o', async (override) => {
        const { service, callback, balance } = fixture();
        await expect(service.anypay({ ...callback, ...override })).rejects.toThrow();
        expect(balance.increment).not.toHaveBeenCalled();
    });
    it('rejects a callback from another provider', async () => {
        const { service, callback, order, balance } = fixture();
        order.provider = PayProviders.FREEKASSA;
        await expect(service.anypay(callback)).rejects.toThrow();
        expect(balance.increment).not.toHaveBeenCalled();
    });
});
