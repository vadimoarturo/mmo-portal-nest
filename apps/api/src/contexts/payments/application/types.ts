import { PayProviders } from '#Root/shared/domain/enum/index';

export interface IPayCreate {
    readonly amount: string;
    readonly login: string;
    readonly provider: PayProviders;
    readonly lang?: string;
}
