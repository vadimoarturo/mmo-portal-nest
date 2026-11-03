import { PayProviders } from '#Common/enum';
import { IsArray, IsEnum, IsNumberString, IsString } from 'class-validator';

class PayBonusDTO {
    @IsNumberString()
    readonly amount: string;

    @IsNumberString()
    readonly percent: string;
}

export class PayListDTO {
    @IsEnum(PayProviders)
    readonly provider: PayProviders;

    @IsNumberString()
    readonly min: string;

    @IsNumberString()
    readonly rate: string;

    @IsString()
    readonly icon: string;

    @IsArray()
    readonly bonus: PayBonusDTO[];
}
