import Decimal from 'decimal.js';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/index';

// Isolated from the global Decimal constructor configuration.
const Exact = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_UP });
export class Money {
    private constructor(private readonly value: Decimal) {}
    static parse(value: string, allowZero = false): Money {
        return Money.from(value, allowZero, '9000000000');
    }
    static balance(value: string): Money {
        return Money.from(value, true, '99999999999999999.99');
    }
    private static from(value: string, allowZero: boolean, maximum: string): Money {
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
            Money.invalid();
        }
        const number = new Exact(value);
        if (number.isNegative() || (!allowZero && number.isZero()) || number.gt(maximum)) {
            Money.invalid();
        }
        return new Money(number);
    }
    static calculate(value: Decimal.Value): Money {
        return Money.parse(new Exact(value).toFixed(2), true);
    }
    private static invalid(): never {
        throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.MIN_AMOUNT });
    }
    multiply(count: number): Money {
        if (!Number.isSafeInteger(count) || count < 1) {
            Money.invalid();
        }
        return Money.calculate(this.value.times(count));
    }
    plus(other: Money): Money {
        return Money.balance(this.value.plus(other.value).toFixed(2));
    }
    lessThan(other: Money): boolean {
        return this.value.lt(other.value);
    }
    equals(other: Money): boolean {
        return this.value.eq(other.value);
    }
    toFixed(): string {
        return this.value.toFixed(2);
    }
}
export { Exact };
