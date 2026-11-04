import { WalletBalance } from './wallet-balance';
import { Money } from '#Root/shared/domain/money';

describe('Wallet balance rules', () => {
    it('allows spending the exact available balance', () => {
        expect(() => WalletBalance.restore('1.25').requireFunds(Money.parse('1.25'))).not.toThrow();
    });
    it('rejects an overdraft before persistence', () => {
        expect(() => WalletBalance.restore('1.24').requireFunds(Money.parse('1.25'))).toThrow();
    });
    it('restores balances above the per-transfer limit', () => {
        expect(() => WalletBalance.restore('9000000001').requireFunds(Money.parse('9000000000'))).not.toThrow();
    });
});
