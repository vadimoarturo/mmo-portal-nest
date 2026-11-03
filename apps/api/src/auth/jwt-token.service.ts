import { createHash } from 'node:crypto';
import { PrismaService } from '#Core/prisma/prisma.service';
import { AuthJwtTokenType, IAuthJwtVerify } from '#Auth/type';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayloadDTO } from './dto/auth-jwt-payload.dto';
import { AuthJwtAccessDTO, AuthJwtVerifyDTO } from './dto/auth-jwt-access.dto';

@Injectable()
export class JwtTokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    private lifetime(value: string): number {
        const match = /^([1-9]\d*)([smhd])$/.exec(value ?? '');
        if (!match) {
            throw new Error('Invalid token lifetime');
        }
        return Number(match[1]) * { s: 1, m: 60, h: 3600, d: 86400 }[match[2]];
    }

    async verifyJwt({ token, type }: IAuthJwtVerify): Promise<AuthJwtPayloadDTO> {
        let secret: string;
        switch (type) {
            case AuthJwtTokenType.ACCESS:
                secret = process.env.JWT_SECRET_ACCESS;
                break;
            case AuthJwtTokenType.REFRESH:
                secret = process.env.JWT_SECRET_REFRESH;
                break;
            case AuthJwtTokenType.VERIFY:
                secret = process.env.JWT_SECRET_VERIFY;
                break;
            default:
                secret = undefined;
                break;
        }
        if (!secret) {
            throw new Error('Для валидации JWT type: ${type}, нет secret из env переменой');
        }
        try {
            const payload = await this.jwtService.verifyAsync<AuthJwtPayloadDTO>(token, { secret });
            if (type !== AuthJwtTokenType.VERIFY) {
                const user = await this.prisma.user.findUnique({ where: { login: payload.login }, select: { passwd: true, email_verify: true } });
                if (!user || payload.credentialVersion !== createHash('sha256').update(user.passwd).digest('hex')) {
                    throw new Error('Session is no longer valid');
                }
                return { ...payload, isVerifyEmail: user.email_verify };
            }
            return payload;
        } catch (err) {
            throw new Error(err);
        }
    }

    async generateVerifyToken(data: AuthJwtPayloadDTO, purpose: 'email-verification' | 'password-reset'): Promise<AuthJwtVerifyDTO> {
        const verifyToken: string = await this.jwtService.signAsync(
            { ...data, purpose },
            {
                secret: process.env.JWT_SECRET_VERIFY,
                expiresIn: this.lifetime(process.env.JWT_SECRET_VERIFY_EXPIRESIN),
            },
        );
        return {
            verifyToken: verifyToken,
        };
    }

    async parseToken(token: string): Promise<AuthJwtPayloadDTO> {
        return await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET_VERIFY,
        });
    }

    async generateAccessToken(data: AuthJwtPayloadDTO): Promise<AuthJwtAccessDTO> {
        const accessToken: string = await this.jwtService.signAsync(data, {
            secret: process.env.JWT_SECRET_ACCESS,
            expiresIn: this.lifetime(process.env.JWT_SECRET_ACCESS_EXPIRESIN),
        });
        const refreshToken = await this.jwtService.signAsync(data, {
            secret: process.env.JWT_SECRET_REFRESH,
            expiresIn: this.lifetime(process.env.JWT_SECRET_REFRESH_EXPIRESIN),
        });
        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }
}
