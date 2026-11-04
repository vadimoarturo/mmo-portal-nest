import { IsNumberString, IsString, IsOptional } from 'class-validator';

export class FreeKassaDTO {
    @IsNumberString()
    MERCHANT_ID: string;

    @IsNumberString()
    AMOUNT: string;

    @IsString()
    intid: string;

    @IsString()
    MERCHANT_ORDER_ID: string;

    @IsString()
    P_EMAIL: string;

    @IsString()
    @IsOptional()
    P_PHONE: string;

    @IsNumberString()
    CUR_ID: string;

    @IsString()
    @IsOptional()
    payer_account: string;

    @IsString()
    @IsOptional()
    us_currency: string;

    @IsNumberString()
    @IsOptional()
    commission: string;

    @IsString()
    SIGN: string;
}
