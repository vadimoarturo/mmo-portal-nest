import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, genSaltSync, hashSync } from 'bcrypt';
import { JwtTokenService } from './jwt-token.service';
import { User } from '@prisma/client';
import { ApiError } from '#Common/exception/error.exception';
import { PrismaService } from '#Core/prisma/prisma.service';
import * as crypto from 'crypto';
import { ErrorCodeClient } from '#Common/enum/error-code.enum';
import { AuthSignInDTO } from './dto/auth-signin.dto';
import { ISignInPayload } from './type';
import { AuthSignUpDTO } from './dto/auth-signup.dto';
import { QueueService } from '#Core/queue/queue.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly prisma: PrismaService,
        private readonly queueService: QueueService,
    ) {}

    private hashPassword(password: string): string {
        const saltNumber = 10;
        const salt: string = genSaltSync(saltNumber);
        const hashPassword: string = hashSync(password, salt);
        return hashPassword;
    }

    private generateReferralCode(length = 8) {
        return crypto.randomBytes(length).toString('hex');
    }

    private async getUser(loginOrEmail: string) {
        return await this.prisma.user.findFirst({
            where: {
                OR: [{ email: loginOrEmail }, { login: loginOrEmail }],
            },
        });
    }

    private async userValidate(loginOrEmail: string): Promise<User> {
        const user = await this.getUser(loginOrEmail);
        if (!user) {
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.USER_NOT_FOUND,
            });
        }
        return user;
    }

    private async userExists(email?: string, login?: string): Promise<{ login: string; email_verify: boolean }> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: email }, { login: login }],
            },
            select: {
                login: true,
                email_verify: true,
            },
        });
        if (user) {
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.ACCOUNT_EXIST,
            });
        }
        return user;
    }

    async sendVerifyEmail(email: string, login: string, email_verify: boolean) {
        const verifyToken = await this.jwtTokenService.generateVerifyToken(
            {
                email: email,
                login: login,
                isVerifyEmail: email_verify,
            },
            'email-verification',
        );
        await this.queueService.sendMail({
            email: email,
            template: 'verify-email',
            context: { url: `${process.env.WEB_URL}/auth/email-verify?token=${verifyToken.verifyToken}` },
        });
        return true;
    }

    async sendChangePasswordEmail(email: string): Promise<boolean> {
        const user = await this.getUser(email);
        if (!user) {
            return true;
        }
        const { login, email_verify, passwd } = user;
        const verifyToken = await this.jwtTokenService.generateVerifyToken(
            {
                email: email,
                login: login,
                isVerifyEmail: email_verify,
                credentialVersion: crypto.createHash('sha256').update(passwd).digest('hex'),
            },
            'password-reset',
        );
        await this.queueService.sendMail({
            email: email,
            template: 'change-password',
            context: { url: `${process.env.WEB_URL}/auth/password-change?token=${verifyToken.verifyToken}` },
        });
        return true;
    }

    async changePassword(email: string, password: string, credentialVersion: string) {
        const user = await this.userValidate(email);
        const expected = crypto.createHash('sha256').update(user.passwd).digest('hex');
        if (credentialVersion !== expected) {
            throw new UnauthorizedException();
        }
        const changed = await this.prisma.user.updateMany({
            where: { email, passwd: user.passwd },
            data: {
                passwd: this.hashPassword(password),
                game_password_hash: this.hashPassword(password),
            },
        });
        if (changed.count !== 1) {
            throw new UnauthorizedException();
        }
        return this.signIn(email);
    }

    async verifyEmail(email: string, isVerifyEmail: boolean): Promise<ISignInPayload> {
        const { email_verify } = await this.userValidate(email);
        if (email_verify || isVerifyEmail) {
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.EMAIL_ALREADY_VERIFIED,
            });
        }
        await this.prisma.user.update({
            where: {
                email: email,
            },
            data: {
                email_verify: true,
                auth_ok: 1,
                block: 0,
            },
        });
        return await this.signIn(email);
    }

    async authValidateLocal({ login, password }: AuthSignInDTO): Promise<boolean> {
        const user = await this.getUser(login);
        if (!user) {
            throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.ERROR_PASSWORD_OR_LOGIN });
        }
        const userPassword = user.passwd;
        const isCorrectPassword: boolean = await compare(password, userPassword);
        if (!isCorrectPassword) {
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.ERROR_PASSWORD_OR_LOGIN,
            });
        }
        return true;
    }

    async signIn(loginOrEmail: string, ip?: string, userAgent?: string): Promise<ISignInPayload> {
        const { email, login, email_verify, passwd } = await this.userValidate(loginOrEmail);
        if (ip) {
            await this.prisma.userSession.create({
                data: {
                    login: login,
                    ip: ip,
                    user_agent: userAgent,
                },
            });
        }
        const tokens = await this.jwtTokenService.generateAccessToken({
            email: email,
            login: login,
            isVerifyEmail: email_verify,
            credentialVersion: crypto.createHash('sha256').update(passwd).digest('hex'),
        });
        return {
            tokens: tokens,
            email: email,
            login: login,
            isVerifyEmail: email_verify,
        };
    }

    async referralReward(referralCode: string) {
        const referral = await this.prisma.user.findFirst({
            where: {
                referral_code: referralCode,
            },
        });

        if (referral) {
            await this.prisma.user.update({
                where: {
                    referral_code: referralCode,
                },
                data: {
                    referral_count: {
                        increment: 1,
                    },
                },
                select: {
                    login: true,
                },
            });
            // отправить подарок реферальный и пользователю и партнеру
        }
    }

    async signUp({ email, login, password, referralCode }: AuthSignUpDTO, ip: string, userAgent: string): Promise<ISignInPayload> {
        await this.userExists(email, login);
        const hashPassword = this.hashPassword(password);
        const gamePassword = this.hashPassword(password);
        await this.prisma.user.create({
            data: {
                login: login,
                email: email,
                passwd: hashPassword,
                game_password_hash: gamePassword,
                referral_code: this.generateReferralCode(),
                referral_parent: referralCode,
                UserSession: {
                    create: {
                        ip: ip,
                        user_agent: userAgent,
                    },
                },
                email_verify: false,
                auth_ok: 0,
                block: 1,
            },
        });
        await this.sendVerifyEmail(email, login, false);
        if (referralCode) {
            await this.referralReward(referralCode);
        }
        const tokens = await this.jwtTokenService.generateAccessToken({
            email: email,
            login: login,
            isVerifyEmail: false,
            credentialVersion: crypto.createHash('sha256').update(hashPassword).digest('hex'),
        });
        return {
            tokens: tokens,
            email: email,
            login: login,
            isVerifyEmail: false,
        };
    }
}
