import { TransactionContext } from '#Root/shared/application/transaction';
import { PaymentOrder, BonusTier } from '../domain/payment-order';
import { PayProviders } from '#Root/shared/domain/enum/index';
import { PayListDTO } from './contracts/pay-list.dto';
import { PayCreateResponseDTO } from './contracts/pay-create.dto';
export interface PaymentProviderConfig {
    rate: string;
    min: string;
}
export interface PaymentRepository {
    findOrder(id: string, context: TransactionContext): Promise<PaymentOrder | null>;
    bonuses(provider: PayProviders, context: TransactionContext): Promise<BonusTier[] | null>;
    claim(id: string, total: string, transactionId: string | undefined, context: TransactionContext): Promise<boolean>;
    activeProvider(provider: PayProviders): Promise<PaymentProviderConfig | null>;
    createOrder(data: { id: string; currency: string; status: string; amount: string; rate: string; amount_credits: string; login: string; provider: string }): Promise<void>;
    list(): Promise<PayListDTO[]>;
}
export interface PaymentGateway {
    nextOrderId(): string;
    pay(provider: PayProviders, request: { orderId: string; amount: number; currency: string; lang?: string }): Promise<PayCreateResponseDTO>;
}
