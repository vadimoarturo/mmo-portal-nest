import { PayProviders } from '#Root/shared/domain/enum/index';

export interface PayBonusDTO {
    readonly amount: string;

    readonly percent: string;
}

export interface PayListDTO {
    readonly provider: PayProviders;

    readonly min: string;

    readonly rate: string;

    readonly icon: string;

    readonly bonus: PayBonusDTO[];
}
