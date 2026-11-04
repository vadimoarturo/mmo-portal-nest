import { PayProviders } from '#Root/shared/domain/enum/index';

export interface PayCreateRequestDTO {
    readonly amount: string;

    readonly provider: PayProviders;

    readonly lang?: string;
}

export interface PayCreateResponseDTO {
    readonly type: 'redirect' | 'payment';

    readonly url?: string;

    readonly currency?: string;

    readonly amount?: string;
}
