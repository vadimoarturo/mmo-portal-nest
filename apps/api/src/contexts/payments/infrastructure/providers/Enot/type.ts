export interface IEnotRequest {
    order_id: string;
    shop_id: string;
    currency: string;
    amount: number;
}

export interface IEnotResponse {
    data: {
        id: string;
        amount: number;
        currency: string;
        url: string;
        expired: string;
    } | null;
    status: number;
    status_check: boolean;
    error?: string;
}

export enum EnotStatus {
    success = 'success',
    fail = 'fail',
    expired = 'expired',
    refund = 'refund',
}
