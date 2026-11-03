import { PayProviders } from '#Common/enum';

export interface IPayCreate {
    readonly amount: string;
    readonly login: string;
    readonly provider: PayProviders;
    readonly lang?: string;
}
