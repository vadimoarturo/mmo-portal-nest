import { ShopService } from './shop.service';
import { GameServerName } from '#Common/enum';

function fixture() {
    const item = { item_id: 1, price: '0.10', sale: '', game_id: 7, is_stack: true, is_set: false, item_count: 2, game_id_set: null };
    const tx = { shopItem: { findFirst: jest.fn().mockResolvedValue(item) }, historyBuy: { create: jest.fn() } };
    const prisma = { $transaction: jest.fn((fn) => fn(tx)) };
    const game = { insertItem: jest.fn() };
    const balance = { decrement: jest.fn().mockResolvedValue('9.70') };
    const service = new ShopService(prisma as never, { getService: () => game } as never, { checkUser: async () => ({ account_id: 7 }) } as never, {} as never, balance as never);
    const request = { login: 'player', itemId: 1, count: 3, serverName: GameServerName.MMO };
    return { service, tx, game, balance, request };
}

describe('Marketplace checkout', () => {
    it('charges an exact decimal total and delivers the requested quantity in one transaction', async () => {
        const { service, tx, game, balance, request } = fixture();
        await service.buyShopItem(request);
        expect(balance.decrement).toHaveBeenCalledWith('player', '0.30', tx);
        expect(game.insertItem).toHaveBeenCalledWith(expect.objectContaining({ accountId: 7, count: 6 }), tx);
        expect(tx.historyBuy.create).toHaveBeenCalledWith({ data: expect.objectContaining({ item_total_price: '0.30', current_balance: '10.00', updated_balance: '9.70' }) });
    });
    it.each([0, -1, 1.5, 1001])('rejects invalid quantity %s', async (count) => {
        const { service, balance, request } = fixture();
        await expect(service.buyShopItem({ ...request, count })).rejects.toThrow();
        expect(balance.decrement).not.toHaveBeenCalled();
    });
    it('does not debit for an unavailable item or server', async () => {
        const { service, tx, balance, request } = fixture();
        tx.shopItem.findFirst.mockResolvedValue(null);
        await expect(service.buyShopItem(request)).rejects.toThrow();
        expect(balance.decrement).not.toHaveBeenCalled();
    });
});
