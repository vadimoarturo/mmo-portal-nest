export interface AuthJwtAccessDTO {
    readonly accessToken: string;

    readonly refreshToken: string;
}

export interface AuthJwtVerifyDTO {
    readonly verifyToken: string;
}
