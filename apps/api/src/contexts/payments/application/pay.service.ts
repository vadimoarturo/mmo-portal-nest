import { PaymentGateway, PaymentRepository } from './payment.port';
import { PaymentQuote } from '../domain/payment-order';
import { IPayCreate } from './types';
import { PayStatus, ErrorCodeClient } from '#Root/shared/domain/enum/index';
import { DomainError } from '#Root/shared/domain/domain-error';
export class PayService {
    constructor(
        private readonly orders: PaymentRepository,
        private readonly gateway: PaymentGateway,
    ) {}
    async payCreate({ amount, login, provider, lang }: IPayCreate) {
        try {
            const config = await this.orders.activeProvider(provider);
            if (!config) {
                throw new Error('Provider unavailable');
            }
            const quote = PaymentQuote.create(amount, config.rate, config.min);
            const id = this.gateway.nextOrderId();
            const currency = 'USD';
            await this.orders.createOrder({ id, currency, status: PayStatus.NEW, amount: quote.amountUsd, rate: quote.rate, amount_credits: amount, login, provider });
            return await this.gateway.pay(provider, { orderId: id, amount: Number(quote.amountUsd), currency, lang });
        } catch {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.PAY_CREATE_ERROR });
        }
    }
    payList() {
        return this.orders.list();
    }
}
