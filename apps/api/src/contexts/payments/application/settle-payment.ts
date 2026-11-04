import { UnitOfWork } from '#Root/shared/application/transaction';
import { WalletPort } from '#Root/contexts/wallet/application/wallet.port';
import { PaymentRepository } from './payment.port';
import { PaymentReceipt, PaymentOrder, BonusPolicy } from '../domain/payment-order';
export class SettlePayment {
    constructor(
        private readonly orders: PaymentRepository,
        private readonly wallet: WalletPort,
        private readonly uow: UnitOfWork,
    ) {}
    execute(receipt: PaymentReceipt) {
        return this.uow.run(async (context) => {
            const order = await this.orders.findOrder(receipt.orderId, context);
            if (!order) {
                PaymentOrder.unavailable();
            }
            if (order.accept(receipt) === 'already-settled') {
                return true;
            }
            const tiers = await this.orders.bonuses(receipt.provider, context);
            if (!tiers) {
                PaymentOrder.unavailable();
            }
            const total = BonusPolicy.total(order.data.rate, receipt.amount, tiers);
            if (!(await this.orders.claim(order.data.id, total, receipt.transactionId, context))) {
                return true;
            }
            await this.wallet.increment(order.data.login, total, 'pay', context);
            return true;
        });
    }
}
