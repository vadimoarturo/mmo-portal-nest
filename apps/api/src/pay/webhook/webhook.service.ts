import { Prisma } from '@prisma/client';
import { money } from '#User/balance.service';
import { BalanceService } from '#User/balance.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '#Core/prisma/prisma.service';
import { PayStatus } from '../../common/enum/pay-status.enum';
import { FreeKassaDTO } from '../providers/FreeKassa/dto';
import { ErrorCodeWebhook, PayProviders } from '../../common/enum';
import { AnyPayDTO } from '#Pay/providers/AnyPay/dto';
import { ApiError } from '#Common/exception/error.exception';
import { AnyPayStatus } from '#Pay/providers/AnyPay/type';
import { Logger } from '@nestjs/common';
import { EnotWebhookDTO } from '#Pay/providers/Enot/dto';
import { EnotStatus } from '#Pay/providers/Enot/type';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);
    constructor(
        private readonly balanceService: BalanceService,
        private readonly prisma: PrismaService,
    ) {}

    private calcAmountTotal(rate: string, amount: string, bonus: { amount: string; percent: string }[]) {
        const base = new Prisma.Decimal(rate).times(amount);
        const tier = bonus.filter((entry) => base.greaterThanOrEqualTo(entry.amount)).sort((a, b) => new Prisma.Decimal(b.amount).comparedTo(a.amount))[0];
        return base.times(new Prisma.Decimal(1).plus(new Prisma.Decimal(tier?.percent ?? 0).div(100))).toFixed(2);
    }

    private async successOrderTransaction(data: { orderId: string; amount: string; provider: PayProviders; currency: string; transactionId?: string }) {
        const received = money(data.amount);
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.orderTransaction.findUnique({ where: { id: data.orderId } });
            if (!order || order.provider !== data.provider || order.currency.toUpperCase() !== data.currency.toUpperCase() || !received.equals(order.amount)) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeWebhook.ORDER_TRANSACTION_NOT_FOUND });
            }
            if (order.status === PayStatus.SUCCESS) {
                return true;
            }
            if (order.status !== PayStatus.NEW) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeWebhook.ORDER_TRANSACTION_NOT_FOUND });
            }
            const provider = await tx.payProvider.findUnique({ where: { provider: data.provider }, include: { bonus: true } });
            if (!provider) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeWebhook.ORDER_TRANSACTION_NOT_FOUND });
            }
            const total = this.calcAmountTotal(order.rate, data.amount, provider.bonus);
            const claim = await tx.orderTransaction.updateMany({
                where: { id: order.id, status: PayStatus.NEW },
                data: { status: PayStatus.SUCCESS, amount_credits: total, provider_id: data.transactionId },
            });
            if (claim.count === 0) {
                return true;
            }
            await this.balanceService.increment(order.login, total, 'pay', tx);
            return true;
        });
    }

    freekassa({ MERCHANT_ORDER_ID, AMOUNT, us_currency }: FreeKassaDTO) {
        return this.successOrderTransaction({ orderId: String(MERCHANT_ORDER_ID), amount: String(AMOUNT), provider: PayProviders.FREEKASSA, currency: String(us_currency) });
    }

    anypay({ pay_id, amount, currency, status, test, transaction_id }: AnyPayDTO) {
        if (status === AnyPayStatus.paid && test !== '1') {
            return this.successOrderTransaction({
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
            return this.successOrderTransaction({
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
