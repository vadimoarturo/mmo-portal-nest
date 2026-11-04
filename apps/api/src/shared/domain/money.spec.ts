import { Money } from './money';
describe('Money value object', () => {
    it('calculates fractional purchases exactly', () => expect(Money.parse('0.10').multiply(3).toFixed()).toBe('0.30'));
    it('allows an empty balance but rejects an empty transfer', () => {
        expect(Money.parse('0', true).toFixed()).toBe('0.00');
        expect(() => Money.parse('0')).toThrow();
    });
    it('rejects arithmetic outside the transfer limit', () => expect(() => Money.parse('9000000000').multiply(2)).toThrow());
    it('supports persisted balances larger than the single-transfer limit', () => {
        expect(Money.balance('9000000001').plus(Money.parse('1')).toFixed()).toBe('9000000002.00');
        expect(() => Money.parse('9000000001')).toThrow();
    });
    it('compares values rather than string representations', () => expect(Money.parse('01.0').equals(Money.parse('1.00'))).toBe(true));
});
