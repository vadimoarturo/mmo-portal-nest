import { Injectable } from '@nestjs/common';
import { IPayProvider } from '../types';
import { ConfigService } from '@nestjs/config';
import { IFreeKassaRequest } from './type';
import { PayCreateResponseDTO } from 'src/pay/dto/pay-create.dto';
import * as md5 from 'md5';

@Injectable()
export class FreeKassaService implements IPayProvider {
    constructor(private readonly configService: ConfigService) {}

    async pay(data: { orderId: string; amount: number; currency: string; lang?: string }): Promise<PayCreateResponseDTO> {
        const shopId = this.configService.get('FREEKASSA_SHOP_ID');
        const secretOne = this.configService.get('FREEKASSA_SECRET_ONE');
        const dataFreeKassa: IFreeKassaRequest = {
            shopId: shopId as number,
            paymentId: data.orderId,
            currency: data.currency,
            amount: data.amount,
        };
        const generateSign = md5(dataFreeKassa.shopId + ':' + dataFreeKassa.amount + ':' + secretOne + ':' + dataFreeKassa.currency + ':' + dataFreeKassa.paymentId);
        const urlPayment = `https://fmt.me/?m=${dataFreeKassa.shopId}&oa=${dataFreeKassa.amount}&currency=${dataFreeKassa.currency}&o=${dataFreeKassa.paymentId}&s=${generateSign}&us_currency=${dataFreeKassa.currency}&lang=${(data.lang ?? 'en').toLowerCase()}`;
        return {
            type: 'redirect',
            url: urlPayment,
        };
    }
}
