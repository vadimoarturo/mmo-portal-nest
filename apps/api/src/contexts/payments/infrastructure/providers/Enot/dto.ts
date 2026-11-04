import { IsNumberString, IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class EnotWebhookDTO {
    @IsUUID()
    invoice_id: string;

    @IsString()
    status: string;

    @IsNumberString()
    amount: string;

    @IsString()
    currency: string;

    @IsString()
    order_id: string;

    @IsOptional()
    @IsString()
    pay_service?: string;

    @IsOptional()
    @IsString()
    payer_details?: string;

    @IsOptional()
    custom_fields?: any;

    @IsNumber()
    type: number;

    @IsOptional()
    @IsNumberString()
    credited?: string;

    @IsOptional()
    @IsString()
    pay_time?: string;

    @IsNumber()
    code: number;

    @IsOptional()
    @IsString()
    reject_time?: string;

    @IsOptional()
    @IsNumberString()
    refund_amount?: string;

    @IsOptional()
    @IsString()
    refund_reason?: string;

    @IsOptional()
    @IsString()
    refund_time?: string;
}
