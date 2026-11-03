export interface IEmailVerifyData {
    readonly email: string;
    readonly code: number;
    readonly expiration: number;
}
