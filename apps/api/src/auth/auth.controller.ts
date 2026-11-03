import { Body, Controller, Get, HttpCode, Post, Req, Res, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthJwtAccessDTO } from './dto/auth-jwt-access.dto';
import { AuthSignInDTO } from './dto/auth-signin.dto';
import { AuthSignUpDTO } from './dto/auth-signup.dto';
import { CookieStore } from '#Common/enum';
import { Response, Request } from 'express';
import { AuthService } from '#Auth/auth.service';
import { AuthValidateLocalGuard } from '#Auth/guard/auth-validate-local.guard';
import { AuthAccessGuard } from '#Auth/guard/auth-access.guard';
import { AuthVerifyGuard } from './guard/auth-verify.guard';
import { AuthUser } from '#Common/decorator/auth-user.decorator';
import { AuthJwtPayloadDTO } from './dto/auth-jwt-payload.dto';
import { AuthChangePasswordDTO, AuthChangePasswordVerifyDTO } from './dto/auth-change-password.dto';
import { Throttle } from '@nestjs/throttler';
import { AuthVerifyEmailDTO } from './dto/auth-verify-email.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() data: AuthSignUpDTO, @Res({ passthrough: true }) res: Response, @Req() req: Request): Promise<AuthJwtAccessDTO> {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        const signInPayload = await this.authService.signUp(data, ip, userAgent);
        res.cookie(CookieStore.accessToken, signInPayload.tokens.accessToken, {
            httpOnly: true,
            secure: true,
        });
        res.cookie(CookieStore.refreshToken, signInPayload.tokens.refreshToken, {
            httpOnly: true,
            secure: true,
        });
        res.cookie(CookieStore.email, signInPayload.email);
        res.cookie(CookieStore.login, signInPayload.login);
        res.cookie(CookieStore.isVerifyEmail, signInPayload.isVerifyEmail);
        return signInPayload.tokens;
    }

    @UseGuards(AuthValidateLocalGuard)
    @Post('signin')
    @HttpCode(200)
    async signIn(@Body() { login }: AuthSignInDTO, @Res({ passthrough: true }) res: Response, @Req() req: Request): Promise<AuthJwtAccessDTO> {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        const signInPayload = await this.authService.signIn(login, ip, userAgent);
        res.cookie(CookieStore.accessToken, signInPayload.tokens.accessToken, {
            httpOnly: true,
            secure: true,
        });
        res.cookie(CookieStore.refreshToken, signInPayload.tokens.refreshToken, {
            httpOnly: true,
            secure: true,
        });
        res.cookie(CookieStore.email, signInPayload.email);
        res.cookie(CookieStore.login, signInPayload.login);
        res.cookie(CookieStore.isVerifyEmail, signInPayload.isVerifyEmail);
        return signInPayload.tokens;
    }

    @UseGuards(AuthAccessGuard)
    @Post('logout')
    @HttpCode(200)
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie(CookieStore.accessToken);
        res.clearCookie(CookieStore.refreshToken);
        res.clearCookie(CookieStore.verifyToken);
        res.clearCookie(CookieStore.email);
        res.clearCookie(CookieStore.login);
        res.status(200).send(true);
    }

    @UseGuards(AuthVerifyGuard)
    @SetMetadata('verifyPurpose', 'email-verification')
    @Post('verify/email')
    async verifyEmail(
        @Body() data: AuthVerifyEmailDTO,
        @AuthUser() { email, isVerifyEmail }: AuthJwtPayloadDTO,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthJwtAccessDTO> {
        res.clearCookie(CookieStore.accessToken);
        res.clearCookie(CookieStore.refreshToken);
        res.clearCookie(CookieStore.verifyToken);
        res.clearCookie(CookieStore.email);
        res.clearCookie(CookieStore.login);
        const signInPayload = await this.authService.verifyEmail(email, isVerifyEmail);
        res.cookie(CookieStore.accessToken, signInPayload.tokens.accessToken, {
            httpOnly: true,
            secure: true,
        });
        res.cookie(CookieStore.refreshToken, signInPayload.tokens.refreshToken, {
            httpOnly: true,
            secure: true,
        });
        res.cookie(CookieStore.email, signInPayload.email);
        res.cookie(CookieStore.login, signInPayload.login);
        res.cookie(CookieStore.isVerifyEmail, signInPayload.isVerifyEmail);
        return signInPayload.tokens;
    }

    @UseGuards(AuthAccessGuard)
    @Throttle({ default: { limit: 15, ttl: 60000 } })
    @Get('verify/email/resend')
    async resendVerifyEmail(@AuthUser() { email, login }: AuthJwtPayloadDTO): Promise<boolean> {
        return await this.authService.sendVerifyEmail(email, login, false);
    }

    @Throttle({ default: { limit: 15, ttl: 60000 } })
    @Post('password/resend')
    async changePassword(@Body() { email }: AuthChangePasswordDTO): Promise<boolean> {
        return await this.authService.sendChangePasswordEmail(email);
    }

    @UseGuards(AuthVerifyGuard)
    @SetMetadata('verifyPurpose', 'password-reset')
    @Post('verify/password')
    async verifyChangePassword(
        @Body() { password }: AuthChangePasswordVerifyDTO,
        @AuthUser() { email, credentialVersion }: AuthJwtPayloadDTO,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthJwtAccessDTO> {
        res.clearCookie(CookieStore.accessToken);
        res.clearCookie(CookieStore.refreshToken);
        res.clearCookie(CookieStore.verifyToken);
        res.clearCookie(CookieStore.email);
        res.clearCookie(CookieStore.login);
        const signInPayload = await this.authService.changePassword(email, password, credentialVersion);
        res.cookie(CookieStore.accessToken, signInPayload.tokens.accessToken, {
            httpOnly: true,
            secure: true,
        });
        res.cookie(CookieStore.refreshToken, signInPayload.tokens.refreshToken, {
            httpOnly: true,
            secure: true,
        });
        res.cookie(CookieStore.email, signInPayload.email);
        res.cookie(CookieStore.login, signInPayload.login);
        res.cookie(CookieStore.isVerifyEmail, signInPayload.isVerifyEmail);
        return signInPayload.tokens;
    }
}
