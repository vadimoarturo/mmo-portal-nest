import { IsString } from 'class-validator';

export class AuthVerifyEmailDTO {
    @IsString()
    readonly token: string;
}
