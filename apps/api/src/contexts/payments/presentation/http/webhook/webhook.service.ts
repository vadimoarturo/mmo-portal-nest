import { Injectable, Logger } from '@nestjs/common';
import { SettlePayment } from '../../../application/settle-payment';
import { PayProviders } from '#Root/shared/domain/enum/index';
import { FreeKassaDTO } from '../../../infrastructure/providers/FreeKassa/dto';
import { AnyPayDTO } from '../../../infrastructure/providers/AnyPay/dto';
import { AnyPayStatus } from '../../../infrastructure/providers/AnyPay/type';
import { EnotWebhookDTO } from '../../../infrastructure/providers/Enot/dto';
import { EnotStatus } from '../../../infrastructure/providers/Enot/type';
@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);
    constructor(private readonly settlement: SettlePayment) {}
    freekassa({ MERCHANT_ORDER_ID, AMOUNT, us_currency }: FreeKassaDTO) {
        return this.settlement.execute({ orderId: String(MERCHANT_ORDER_ID), amount: String(AMOUNT), provider: PayProviders.FREEKASSA, currency: String(us_currency) });
    }

    anypay({ pay_id, amount, currency, status, test, transaction_id }: AnyPayDTO) {
        if (status === AnyPayStatus.paid && test !== '1') {
            return this.settlement.execute({
                orderId: String(pay_id),
                amount: String(amount),
                provider: PayProviders.ANYPAY,
                currency: String(currency),
                transactionId: String(transaction_id),
            });
        } else {
            this.logger.error(`AnyPay status: ${status} for order: ${pay_id}, test: ${test}`);
            return false;
        }
    }

    enot({ invoice_id, amount, currency, status, order_id }: EnotWebhookDTO) {
        if (status === EnotStatus.success) {
            return this.settlement.execute({
                orderId: String(order_id),
                amount: String(amount),
                provider: PayProviders.ENOT,
                currency: String(currency),
                transactionId: String(invoice_id),
            });
        } else {
            this.logger.error(`Enot status: ${status} for order: ${order_id}`);
            return false;
        }
    }
}
