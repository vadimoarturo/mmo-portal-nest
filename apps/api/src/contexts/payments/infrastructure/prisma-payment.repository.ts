import { Injectable } from '@nestjs/common';
import { PrismaService } from '#Root/platform/prisma/prisma.service';
import { transactionClient } from '#Root/platform/prisma/unit-of-work';
import { TransactionContext } from '#Root/shared/application/transaction';
import { PayProviders, PayStatus } from '#Root/shared/domain/enum/index';
import { PaymentRepository } from '../application/payment.port';
import { PaymentOrder } from '../domain/payment-order';
@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
    constructor(private readonly prisma: PrismaService) {}
    async findOrder(id: string, context: TransactionContext) {
        const order = await transactionClient(context).orderTransaction.findUnique({ where: { id } });
        return order ? new PaymentOrder(order) : null;
    }
    async bonuses(provider: PayProviders, context: TransactionContext) {
        const row = await transactionClient(context).payProvider.findUnique({ where: { provider }, include: { bonus: true } });
        return row?.bonus ?? null;
    }
    async claim(id: string, total: string, transactionId: string | undefined, context: TransactionContext) {
        const result = await transactionClient(context).orderTransaction.updateMany({
            where: { id, status: PayStatus.NEW },
            data: { status: PayStatus.SUCCESS, amount_credits: total, provider_id: transactionId },
        });
        return result.count === 1;
    }
    activeProvider(provider: PayProviders) {
        return this.prisma.payProvider.findFirst({ where: { provider, is_active: true } });
    }
    async createOrder(data: Parameters<PaymentRepository['createOrder']>[0]) {
        await this.prisma.orderTransaction.create({ data });
    }
    async list() {
        const rows = await this.prisma.payProvider.findMany({ where: { is_active: true }, select: { provider: true, icon: true, min: true, rate: true, bonus: true } });
        return rows.map((row) => ({ ...row, provider: row.provider as PayProviders, bonus: row.bonus.map(({ amount, percent }) => ({ amount, percent })) }));
    }
}
