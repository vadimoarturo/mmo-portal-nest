import { Injectable, Logger } from '@nestjs/common';
import { IPayProvider } from '#Root/contexts/payments/infrastructure/providers/types';
import { ConfigService } from '@nestjs/config';
import { IEnotRequest, IEnotResponse } from '#Root/contexts/payments/infrastructure/providers/Enot/type';
import { PayCreateResponseDTO } from '#Root/contexts/payments/application/contracts/pay-create.dto';
import axios from 'axios';

@Injectable()
export class EnotService implements IPayProvider {
    private readonly logger = new Logger(EnotService.name);
    protected readonly api = axios.create({
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    });
    constructor(private readonly configService: ConfigService) {}

    async pay(data: { orderId: string; amount: number; currency: string; lang?: string }): Promise<PayCreateResponseDTO> {
        const shopId = this.configService.get('ENOT_SHOP_ID');
        const secret = this.configService.get('ENOT_SECRET_ONE');
        const dataAnyPay: IEnotRequest = {
            shop_id: shopId as string,
            order_id: data.orderId,
            currency: data.currency,
            amount: data.amount,
        };
        try {
            const response = await this.api.post<IEnotResponse>(`https://api.enot.io/invoice/create`, dataAnyPay, {
                headers: {
                    'x-api-key': secret,
                },
            });
            if (response.data.status === 200) {
                return {
                    type: 'redirect',
                    url: response.data.data.url,
                };
            } else {
                this.logger.error(`Enot error: ${response.data.error}`);
                throw new Error(response.data.error);
            }
        } catch (error) {
            this.logger.error(`Enot error: ${error.message}`);
            throw new Error(error.message);
        }
    }
}
