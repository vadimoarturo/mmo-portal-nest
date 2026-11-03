import { AuthJwtTokenType } from '#Auth/type';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { CookieStore } from '#Common/enum';
import { JwtTokenService } from '#Auth/jwt-token.service';

@Injectable()
export abstract class AuthBaseGuard implements CanActivate {
    constructor(protected readonly jwtTokenService: JwtTokenService) {}

    protected abstract tokenType: AuthJwtTokenType;

    private extractTokenFromCookie(request: Request) {
        if (this.tokenType === AuthJwtTokenType.VERIFY && request.body) {
            return { token: request.body.token, tokenRefresh: undefined };
        }
        if (request.cookies) {
            let token: string;
            let tokenRefresh: string = null;
            switch (this.tokenType) {
                case AuthJwtTokenType.ACCESS:
                    token = request.cookies[CookieStore.accessToken];
                    tokenRefresh = request.cookies[CookieStore.refreshToken];
                    break;
                default:
                    token = undefined;
                    break;
            }
            return { token: token, tokenRefresh: tokenRefresh };
        }
        return { token: undefined, tokenRefresh: undefined };
    }

    private clearCookie(res: any) {
        res.clearCookie(CookieStore.accessToken);
        res.clearCookie(CookieStore.refreshToken);
        res.clearCookie(CookieStore.verifyToken);
        res.clearCookie(CookieStore.login);
        res.clearCookie(CookieStore.email);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { token, tokenRefresh } = this.extractTokenFromCookie(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtTokenService.verifyJwt({
                token: token,
                type: this.tokenType,
            });
            request['user'] = payload;
        } catch {
            if (this.tokenType === AuthJwtTokenType.ACCESS) {
                if (!tokenRefresh) {
                    throw new UnauthorizedException();
                }
                try {
                    const payload = await this.jwtTokenService.verifyJwt({
                        token: tokenRefresh,
                        type: AuthJwtTokenType.REFRESH,
                    });
                    const refreshData = await this.jwtTokenService.generateAccessToken({
                        email: payload.email,
                        login: payload.login,
                        isVerifyEmail: payload.isVerifyEmail,
                        credentialVersion: payload.credentialVersion,
                    });
                    response.cookie(CookieStore.accessToken, refreshData.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                    });
                    request['user'] = payload;
                } catch {
                    this.clearCookie(response);
                    throw new UnauthorizedException();
                }
            } else {
                this.clearCookie(response);
                throw new UnauthorizedException();
            }
        }
        return true;
    }
}
