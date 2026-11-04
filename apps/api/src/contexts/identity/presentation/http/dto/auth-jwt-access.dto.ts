import { IsString } from 'class-validator';

export class AuthJwtAccessDTO {
    @IsString()
    readonly accessToken: string;

    @IsString()
    readonly refreshToken: string;
}

export class AuthJwtVerifyDTO {
    @IsString()
    readonly verifyToken: string;
}
