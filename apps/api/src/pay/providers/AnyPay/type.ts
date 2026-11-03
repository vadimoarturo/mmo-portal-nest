import { PayStatus } from '#Common/enum/pay-status.enum';

export interface IAnyPayRequest {
    merchant_id: number;
    pay_id: string;
    currency: string;
    amount: number;
}

export enum AnyPayStatus {
    paid = 'paid',
    partially_paid = 'partially-paid',
    waiting = 'waiting',
    refund = 'refund',
    canceled = 'canceled',
    expired = 'expired',
    error = 'error',
}

export const FreeKassaStatusMap = {
    [AnyPayStatus.waiting]: PayStatus.NEW,
    [AnyPayStatus.paid]: PayStatus.SUCCESS,
    [AnyPayStatus.refund]: PayStatus.REFUND,
    [AnyPayStatus.error]: PayStatus.ERROR,
    [AnyPayStatus.canceled]: PayStatus.CANCELED,
};
