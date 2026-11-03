import { BalanceService, money } from './balance.service';
import { PrismaService } from '#Core/prisma/prisma.service';

describe('Wallet precision and atomic updates', () => {
    const tx = { $queryRaw: jest.fn(), historyTopUp: { create: jest.fn() } };
    const prisma = { $transaction: jest.fn((callback) => callback(tx)), user: { findUnique: jest.fn() } };
    const service = new BalanceService(prisma as unknown as PrismaService);
    beforeEach(() => jest.clearAllMocks());

    it.each(['-1', '0', 'NaN', 'Infinity', '1e3', '1.001', '9000000001'])('rejects invalid money %s', (value) => {
        expect(() => money(value)).toThrow();
    });
    it('preserves fractional credits and records the actual previous balance', async () => {
        tx.$queryRaw.mockResolvedValue([{ current_balance: '100.35', previous_balance: '100.10' }]);
        await expect(service.increment('player', '0.25', 'pay')).resolves.toBe('100.35');
        expect(tx.$queryRaw.mock.calls[0][0].join('')).toContain('DECIMAL(19, 2)');
        expect(tx.$queryRaw.mock.calls[0]).toContain('0.25');
        expect(tx.historyTopUp.create).toHaveBeenCalledWith({ data: { login: 'player', current_balance: '100.10', updated_balance: '100.35', method: 'pay' } });
    });
    it('rejects a debit when the conditional update finds insufficient funds', async () => {
        tx.$queryRaw.mockResolvedValue([]);
        await expect(service.decrement('player', '10')).rejects.toMatchObject({ code: 'USER_INSUFFICIENT_FUNDS' });
    });
    it('joins an existing transaction instead of opening a separate wallet transaction', async () => {
        tx.$queryRaw.mockResolvedValue([{ current_balance: '5.00' }]);
        await service.decrement('player', '1', tx as never);
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });
});
