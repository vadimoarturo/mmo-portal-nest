export interface AuthJwtPayloadDTO {
    readonly credentialVersion?: string;
    readonly purpose?: 'email-verification' | 'password-reset';

    readonly email: string;

    readonly isVerifyEmail: boolean;

    readonly login: string;
}
