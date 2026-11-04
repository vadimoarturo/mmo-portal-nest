import { AuctionLot } from './auction-lot';
import { GameServerName } from '#Root/shared/domain/enum/index';
describe('Auction lot lifecycle', () => {
    const data = { id: 1, login: 'seller', credits: '10', gold: '1000000', server_name: GameServerName.MMO, status: 'active' };
    it('rejects a self-purchase', () => expect(() => new AuctionLot(data).buy('seller')).toThrow());
    it.each(['completed', 'canceled'])('rejects purchase of a %s lot', (status) => expect(() => new AuctionLot({ ...data, status }).buy('buyer')).toThrow());
    it('only permits the owner to cancel', () => expect(() => new AuctionLot(data).cancel('stranger')).toThrow());
    it('does not mutate a loaded snapshot when proposing a transition', () => {
        expect(new AuctionLot(data).buy('buyer').status).toBe('completed');
        expect(data.status).toBe('active');
    });
    it('rejects scientific notation for game gold', () => expect(() => AuctionLot.validateListing('1e6', '10')).toThrow());
});
