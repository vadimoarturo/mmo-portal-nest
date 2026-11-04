import { PayStatus } from '#Root/shared/domain/enum/pay-status.enum';

export interface IFreeKassaRequest {
    shopId: number;
    paymentId: string;
    currency: string;
    amount: number;
}

export enum FreeKassaStatus {
    NEW = 0,
    SUCCESS = 1,
    REFUND = 6,
    ERROR = 8,
    CANCELED = 9,
}

export const FreeKassaStatusMap = {
    [FreeKassaStatus.NEW]: PayStatus.NEW,
    [FreeKassaStatus.SUCCESS]: PayStatus.SUCCESS,
    [FreeKassaStatus.REFUND]: PayStatus.REFUND,
    [FreeKassaStatus.ERROR]: PayStatus.ERROR,
    [FreeKassaStatus.CANCELED]: PayStatus.CANCELED,
};
