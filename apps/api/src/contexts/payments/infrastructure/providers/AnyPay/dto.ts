import { IsNumberString, IsString, IsOptional } from 'class-validator';

export class AnyPayDTO {
    @IsNumberString()
    merchant_id: string;

    @IsOptional()
    @IsNumberString()
    transaction_id?: string;

    @IsString()
    pay_id: string;

    @IsNumberString()
    amount: string;

    @IsString()
    currency: string;

    @IsOptional()
    @IsNumberString()
    profit?: string;

    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    method?: string;

    @IsString()
    status: string;

    @IsNumberString()
    test: string;

    @IsOptional()
    @IsString()
    created_date?: string;

    @IsOptional()
    @IsString()
    completed_date?: string;

    @IsString()
    sign: string;
}
