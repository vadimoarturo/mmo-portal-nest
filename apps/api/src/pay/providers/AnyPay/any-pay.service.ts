import { Injectable } from '@nestjs/common';
import { IPayProvider } from '../types';
import { ConfigService } from '@nestjs/config';
import { IAnyPayRequest } from './type';
import { PayCreateResponseDTO } from 'src/pay/dto/pay-create.dto';
import * as md5 from 'md5';

@Injectable()
export class AnyPayService implements IPayProvider {
    constructor(private readonly configService: ConfigService) {}

    async pay(data: { orderId: string; amount: number; currency: string; lang?: string }): Promise<PayCreateResponseDTO> {
        const shopId = this.configService.get('ANYPAY_SHOP_ID');
        const secret = this.configService.get('ANYPAY_SECRET');
        const dataAnyPay: IAnyPayRequest = {
            merchant_id: shopId as number,
            pay_id: data.orderId,
            currency: data.currency,
            amount: data.amount,
        };
        const generateSign = md5(dataAnyPay.currency + ':' + dataAnyPay.amount + ':' + secret + ':' + dataAnyPay.merchant_id + ':' + dataAnyPay.pay_id);
        const urlPayment = `https://anypay.io/merchant?merchant_id=${dataAnyPay.merchant_id}&amount=${dataAnyPay.amount}&currency=${dataAnyPay.currency}&pay_id=${dataAnyPay.pay_id}&sign=${generateSign}&lang=${(data.lang ?? 'en').toLowerCase()}`;
        return {
            type: 'redirect',
            url: urlPayment,
        };
    }
}
