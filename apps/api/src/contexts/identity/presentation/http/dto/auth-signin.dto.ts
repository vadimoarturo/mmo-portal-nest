import { IsString } from 'class-validator';

export class AuthSignInDTO {
    @IsString()
    readonly password: string;

    @IsString()
    readonly login: string;
}
