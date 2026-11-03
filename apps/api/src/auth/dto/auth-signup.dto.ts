import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class AuthSignUpDTO {
    @IsString()
    @MinLength(8)
    @MaxLength(64)
    @Matches(/^[\x20-\x7e]+$/)
    readonly password: string;

    @IsEmail()
    readonly email: string;

    @IsString()
    @MinLength(4)
    @MaxLength(15)
    @Matches(/^[A-Za-z0-9]+$/)
    readonly login: string;

    @IsString()
    @IsOptional()
    readonly referralCode?: string;
}
