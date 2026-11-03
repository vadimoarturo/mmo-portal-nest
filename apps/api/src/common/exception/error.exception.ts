import { ErrorCodeClient, ErrorCodeInternal } from '#Common/enum/error-code.enum';

type ErrorType = 'INTERNAL' | 'CLIENT';

export interface IApiError {
    type: ErrorType;
    message?: string;
    code?: ErrorCodeClient | ErrorCodeInternal | string;
    data?: object;
}

export class ApiError extends Error {
    public type: ErrorType;
    public code: ErrorCodeClient | ErrorCodeInternal | string;
    public data: object;

    constructor({ type, message, code, data }: IApiError) {
        super(message);
        this.name = this.constructor.name;
        this.type = type;
        this.code = code || '';
        this.data = data || {};
    }

    public toJSON() {
        return {
            type: this.type,
            code: this.code,
            message: this.message,
            ...(this.data && { data: this.data }),
        };
    }
}
