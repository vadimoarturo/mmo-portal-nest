import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { AuthService } from '#Auth/auth.service';

@Injectable()
export class AuthValidateLocalStrategy extends PassportStrategy(Strategy, 'VALIDATE_LOCAL') {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'login',
            passwordField: 'password',
        });
    }

    async validate(login: string, password: string): Promise<boolean> {
        try {
            const isValidate = await this.authService.authValidateLocal({
                login: login,
                password: password,
            });
            if (!isValidate) {
                throw new UnauthorizedException();
            }
            return isValidate;
        } catch (err) {
            throw err;
        }
    }
}
