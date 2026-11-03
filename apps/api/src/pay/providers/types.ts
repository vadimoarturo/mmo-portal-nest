import { PayCreateResponseDTO } from '../dto/pay-create.dto';

export interface IPayProvider {
    pay(data: { orderId: string; amount: number; currency: string; lang?: string }): Promise<PayCreateResponseDTO>;
}
