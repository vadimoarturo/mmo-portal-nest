import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class AuthJwtPayloadDTO {
    readonly credentialVersion?: string;
    readonly purpose?: 'email-verification' | 'password-reset';

    @IsEmail()
    readonly email: string;

    @IsBoolean()
    readonly isVerifyEmail: boolean;

    @IsString()
    readonly login: string;
}
