import { Money, Exact } from '#Root/shared/domain/money';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeWebhook, ErrorCodeClient, PayProviders, PayStatus } from '#Root/shared/domain/enum/index';
export interface PaymentSnapshot {
    id: string;
    login: string;
    provider: string;
    currency: string;
    amount: string;
    rate: string;
    status: string;
}
export interface PaymentReceipt {
    orderId: string;
    amount: string;
    provider: PayProviders;
    currency: string;
    transactionId?: string;
}
export interface BonusTier {
    amount: string;
    percent: string;
}
export class PaymentOrder {
    constructor(readonly data: Readonly<PaymentSnapshot>) {}
    accept(receipt: PaymentReceipt): 'already-settled' | 'settle' {
        const amount = Money.parse(receipt.amount);
        if (
            this.data.id !== receipt.orderId ||
            this.data.provider !== receipt.provider ||
            this.data.currency.toUpperCase() !== receipt.currency.toUpperCase() ||
            !amount.equals(Money.parse(this.data.amount))
        ) {
            PaymentOrder.unavailable();
        }
        if (this.data.status === PayStatus.SUCCESS) {
            return 'already-settled';
        }
        if (this.data.status !== PayStatus.NEW) {
            PaymentOrder.unavailable();
        }
        return 'settle';
    }
    static unavailable(): never {
        throw new DomainError({ type: 'CLIENT', code: ErrorCodeWebhook.ORDER_TRANSACTION_NOT_FOUND });
    }
}
export class BonusPolicy {
    static total(rate: string, amount: string, tiers: readonly BonusTier[]): string {
        const base = new Exact(rate).times(amount);
        if (!base.isFinite() || base.isNegative()) {
            throw new Error('Invalid settlement rate');
        }
        const tier = [...tiers].filter((entry) => base.gte(entry.amount)).sort((a, b) => new Exact(b.amount).cmp(a.amount))[0];
        const percent = new Exact(tier?.percent ?? 0);
        if (!percent.isFinite() || percent.isNegative()) {
            throw new Error('Invalid bonus percentage');
        }
        return Money.calculate(base.times(new Exact(1).plus(percent.div(100)))).toFixed();
    }
}
export class PaymentQuote {
    static create(amount: string, rate: string, minimum: string) {
        const requested = Money.parse(amount);
        const exchange = new Exact(rate);
        if (!exchange.isFinite() || !exchange.gt(0) || requested.lessThan(Money.parse(minimum, true))) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.MIN_AMOUNT, data: { min: minimum } });
        }
        const payable = Money.parse(new Exact(requested.toFixed()).div(exchange).toFixed(2));
        return { amountUsd: payable.toFixed(), rate: exchange.toString() };
    }
}
