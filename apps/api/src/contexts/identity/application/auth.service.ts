import { IdentityRepository, CredentialPort, TokenPort, IdentityNotifications } from './identity.port';
import { Account, InvalidCredentials } from '../domain/account';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/index';
import { AuthSignInDTO } from './contracts/auth-signin.dto';
import { AuthSignUpDTO } from './contracts/auth-signup.dto';
import { ISignInPayload } from './type';
export class AuthService {
    constructor(
        private readonly tokens: TokenPort,
        private readonly accounts: IdentityRepository,
        private readonly notifications: IdentityNotifications,
        private readonly credentials: CredentialPort,
    ) {}
    private async requireUser(loginOrEmail: string) {
        const user = await this.accounts.find(loginOrEmail);
        if (!user) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.USER_NOT_FOUND });
        }
        return user;
    }
    async sendVerifyEmail(email: string, login: string, email_verify: boolean) {
        const token = await this.tokens.generateVerifyToken({ email, login, isVerifyEmail: email_verify }, 'email-verification');
        await this.notifications.verification(email, token.verifyToken);
        return true;
    }
    async sendChangePasswordEmail(email: string): Promise<boolean> {
        const user = await this.accounts.find(email);
        if (!user) {
            return true;
        }
        const token = await this.tokens.generateVerifyToken(
            { email: user.email, login: user.login, isVerifyEmail: user.email_verify, credentialVersion: this.credentials.version(user.passwd) },
            'password-reset',
        );
        await this.notifications.passwordReset(user.email, token.verifyToken);
        return true;
    }
    async changePassword(email: string, password: string, credentialVersion: string) {
        const user = await this.requireUser(email);
        new Account(user).authorizeReset(credentialVersion, this.credentials.version(user.passwd), password);
        const changed = await this.accounts.replacePassword(email, user.passwd, this.credentials.hash(password), this.credentials.hash(password));
        if (!changed) {
            throw new InvalidCredentials();
        }
        return this.signIn(email);
    }
    async verifyEmail(email: string, isVerifyEmail: boolean): Promise<ISignInPayload> {
        const user = await this.requireUser(email);
        await this.accounts.verifyEmail(email, new Account(user).verifyEmail(isVerifyEmail));
        return this.signIn(email);
    }
    async authValidateLocal({ login, password }: AuthSignInDTO): Promise<boolean> {
        const user = await this.accounts.find(login);
        if (!user || !(await this.credentials.compare(password, user.passwd))) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.ERROR_PASSWORD_OR_LOGIN });
        }
        return true;
    }
    async signIn(loginOrEmail: string, ip?: string, userAgent?: string): Promise<ISignInPayload> {
        const user = await this.requireUser(loginOrEmail);
        if (ip) {
            await this.accounts.recordSession(user.login, ip, userAgent);
        }
        const tokens = await this.tokens.generateAccessToken({
            email: user.email,
            login: user.login,
            isVerifyEmail: user.email_verify,
            credentialVersion: this.credentials.version(user.passwd),
        });
        return { tokens, email: user.email, login: user.login, isVerifyEmail: user.email_verify };
    }
    referralReward(code: string) {
        return this.accounts.rewardReferral(code);
    }
    async signUp({ email, login, password, referralCode }: AuthSignUpDTO, ip: string, userAgent: string): Promise<ISignInPayload> {
        const state = Account.register(login, email, password);
        if (await this.accounts.exists(email, login)) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.ACCOUNT_EXIST });
        }
        const passwordHash = this.credentials.hash(password);
        await this.accounts.register({
            ...state,
            passwd: passwordHash,
            game_password_hash: this.credentials.hash(password),
            referral_code: this.credentials.referralCode(),
            referral_parent: referralCode,
            ip,
            userAgent,
        });
        await this.sendVerifyEmail(email, login, false);
        if (referralCode) {
            await this.referralReward(referralCode);
        }
        const tokens = await this.tokens.generateAccessToken({ email, login, isVerifyEmail: false, credentialVersion: this.credentials.version(passwordHash) });
        return { tokens, email, login, isVerifyEmail: false };
    }
}
