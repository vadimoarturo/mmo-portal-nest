import { Money } from '#Root/shared/domain/money';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/index';
/** A wallet snapshot. Atomic persistence still checks funds at write time. */
export class WalletBalance {
    private constructor(private readonly amount: Money) {}
    static restore(value: string) {
        return new WalletBalance(Money.balance(value));
    }
    requireFunds(amount: Money) {
        if (this.amount.lessThan(amount)) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.USER_INSUFFICIENT_FUNDS });
        }
    }
}
