import { AuthJwtAccessDTO } from './dto/auth-jwt-access.dto';

export enum AuthJwtTokenType {
    ACCESS = 'ACCESS',
    REFRESH = 'REFRESH',
    VERIFY = 'VERIFY',
}

export interface IAuthJwtVerify {
    readonly token: string;
    readonly type: AuthJwtTokenType;
}

export interface ISignInPayload {
    readonly email: string;
    readonly login: string;
    readonly isVerifyEmail: boolean;
    readonly tokens: AuthJwtAccessDTO;
}
