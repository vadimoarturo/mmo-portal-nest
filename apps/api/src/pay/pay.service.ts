import { randomInt } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { money } from '#User/balance.service';
import { Injectable } from '@nestjs/common';
import { PayProvidersFactory } from './providers/providers.factory';
import { PrismaService } from '#Core/prisma/prisma.service';
import { IPayCreate } from './types';
import { PayStatus } from '#Common/enum/pay-status.enum';
import { ErrorCodeClient, PayProviders } from '#Common/enum';
import { ApiError } from '#Common/exception/error.exception';
import { PayCreateResponseDTO } from './dto/pay-create.dto';
import { PayListDTO } from './dto/pay-list.dto';

@Injectable()
export class PayService {
    constructor(
        private readonly payProvidersFactory: PayProvidersFactory,
        private readonly prisma: PrismaService,
    ) {}

    private async calcAmount(amount: string, provider: PayProviders): Promise<{ amountUsd: string; rate: string }> {
        const paymentProvider = await this.prisma.payProvider.findFirst({ where: { provider, is_active: true } });
        if (!paymentProvider) {
            throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.PAY_CREATE_ERROR });
        }
        const requested = money(amount);
        const rate = new Prisma.Decimal(paymentProvider.rate);
        if (!rate.greaterThan(0) || requested.lessThan(paymentProvider.min)) {
            throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.MIN_AMOUNT, data: { min: paymentProvider.min } });
        }
        return { amountUsd: requested.div(rate).toFixed(2), rate: rate.toString() };
    }

    async payCreate({ amount, login, provider, lang }: IPayCreate): Promise<PayCreateResponseDTO> {
        try {
            const { amountUsd, rate } = await this.calcAmount(amount, provider);
            const currency = 'USD';
            const id = `${Date.now()}${randomInt(1000000).toString().padStart(6, '0')}`;
            await this.prisma.orderTransaction.create({
                data: {
                    id: id,
                    currency: currency,
                    status: PayStatus.NEW,
                    amount: amountUsd,
                    rate: rate,
                    amount_credits: amount,
                    login: login,
                    provider: provider,
                },
                select: { id: true },
            });
            const payInfo = await this.payProvidersFactory.getService(provider).pay({ orderId: id, amount: Number(amountUsd), currency: currency, lang: lang });
            return payInfo;
        } catch {
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.PAY_CREATE_ERROR,
            });
        }
    }

    async payList(): Promise<PayListDTO[]> {
        const payList = await this.prisma.payProvider.findMany({
            where: {
                is_active: true,
            },
            select: {
                provider: true,
                icon: true,
                min: true,
                bonus: true,
                rate: true,
            },
        });
        return payList.map((pay) => ({
            provider: pay.provider as PayProviders,
            icon: pay.icon,
            min: pay.min,
            rate: pay.rate,
            bonus: pay.bonus.map((bonus) => ({
                amount: bonus.amount,
                percent: bonus.percent,
            })),
        }));
    }
}
