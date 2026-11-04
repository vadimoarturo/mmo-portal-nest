import { PayProviders } from '#Root/shared/domain/enum/index';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class PayCreateRequestDTO {
    @IsNumberString()
    readonly amount: string;

    @IsEnum(PayProviders)
    readonly provider: PayProviders;

    @IsString()
    @IsOptional()
    readonly lang?: string;
}

export class PayCreateResponseDTO {
    @IsString()
    readonly type: 'redirect' | 'payment';

    @IsString()
    @IsOptional()
    readonly url?: string;

    @IsString()
    @IsOptional()
    readonly currency?: string;

    @IsString()
    @IsOptional()
    readonly amount?: string;
}
