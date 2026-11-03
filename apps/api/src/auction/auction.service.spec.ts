import { AuctionService } from './auction.service';
import { GameServerName } from '#Common/enum';

function fixture() {
    const lot = { id: 1, login: 'seller', credits: '10.25', gold: '1000000', status: 'active', server_name: GameServerName.MMO };
    const tx = { orderAuction: { findUnique: jest.fn().mockResolvedValue(lot), updateMany: jest.fn().mockResolvedValue({ count: 1 }), create: jest.fn() } };
    const prisma = { $transaction: jest.fn((callback) => callback(tx)) };
    const game = {
        checkExistCharacter: jest.fn().mockResolvedValue(true),
        getBalanceInGame: jest.fn().mockResolvedValue(2000000),
        getOnlineCharacters: jest.fn().mockResolvedValue(false),
        getNameMaxLevelCharacter: jest.fn().mockResolvedValue('Player'),
        insertBalanceInGame: jest.fn(),
        removeBalanceInGame: jest.fn(),
    };
    const users = { checkUser: jest.fn().mockResolvedValue({ account_id: 7 }) };
    const balance = { decrement: jest.fn(), increment: jest.fn() };
    const factory = { getService: jest.fn().mockReturnValue(game) };
    const service = new AuctionService(prisma as never, factory as never, users as never, balance as never);
    return { service, tx, game, balance, lot };
}

describe('Auction transaction boundaries', () => {
    it('settles both wallets and game gold in one transaction', async () => {
        const { service, tx, balance, game } = fixture();
        await expect(service.buyLot({ id: 1 }, 'buyer')).resolves.toBe(true);
        expect(balance.decrement).toHaveBeenCalledWith('buyer', '10.25', tx);
        expect(balance.increment).toHaveBeenCalledWith('seller', '10.25', 'auction', tx);
        expect(game.insertBalanceInGame).toHaveBeenCalledWith(7, 1000000, tx);
    });
    it('does not debit the losing buyer when a concurrent request claims the lot', async () => {
        const { service, tx, balance, game } = fixture();
        tx.orderAuction.updateMany.mockResolvedValue({ count: 0 });
        await expect(service.buyLot({ id: 1 }, 'buyer')).rejects.toMatchObject({ code: 'AUCTION_LOT_NOT_FOUND' });
        expect(balance.decrement).not.toHaveBeenCalled();
        expect(game.insertBalanceInGame).not.toHaveBeenCalled();
    });
    it('rejects self-purchases', async () => {
        const { service, balance } = fixture();
        await expect(service.buyLot({ id: 1 }, 'seller')).rejects.toMatchObject({ code: 'AUCTION_LOT_OWN' });
        expect(balance.decrement).not.toHaveBeenCalled();
    });
    it('propagates game delivery failure to the database transaction', async () => {
        const { service, game } = fixture();
        game.insertBalanceInGame.mockRejectedValue(new Error('delivery failed'));
        await expect(service.buyLot({ id: 1 }, 'buyer')).rejects.toThrow('delivery failed');
    });
    it('does not return gold for an already canceled lot', async () => {
        const { service, lot, game } = fixture();
        lot.status = 'canceled';
        await expect(service.cancelLot({ id: 1 }, 'seller')).rejects.toThrow();
        expect(game.insertBalanceInGame).not.toHaveBeenCalled();
    });
    it.each(['-1', '0', '100.001', 'NaN'])('rejects invalid listing price %s', async (credits) => {
        const { service, game } = fixture();
        await expect(service.createLot({ gold: '1000000', credits, serverName: GameServerName.MMO }, 'seller')).rejects.toThrow();
        expect(game.removeBalanceInGame).not.toHaveBeenCalled();
    });
});
