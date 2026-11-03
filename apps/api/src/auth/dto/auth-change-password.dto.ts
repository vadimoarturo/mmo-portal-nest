import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthChangePasswordDTO {
    @IsEmail()
    readonly email: string;
}

export class AuthChangePasswordVerifyDTO {
    @IsString()
    @MinLength(8)
    @MaxLength(64)
    @Matches(/^[\x20-\x7e]+$/)
    readonly password: string;

    @IsString()
    readonly token: string;
}
