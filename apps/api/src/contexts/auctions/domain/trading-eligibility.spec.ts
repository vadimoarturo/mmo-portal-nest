import { TradingEligibility } from './trading-eligibility';

describe('Auction participant eligibility', () => {
    it('accepts an offline character with initialized storage', () => expect(() => TradingEligibility.require({ exists: true, hasStorage: true, online: false })).not.toThrow());
    it.each([
        [{ exists: false, hasStorage: false, online: false }, 'CHARACTER_NOT_FOUND'],
        [{ exists: true, hasStorage: false, online: false }, 'STOCK_ROOM_NOT_OPEN'],
        [{ exists: true, hasStorage: true, online: true }, 'SELECT_CHARACTER_EXIT'],
    ])('rejects an ineligible game state', (state, code) => {
        try {
            TradingEligibility.require(state as never);
            throw new Error('Expected a domain failure');
        } catch (error) {
            expect(error).toMatchObject({ code });
        }
    });
});
