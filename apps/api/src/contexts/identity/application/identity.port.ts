import { AuthJwtPayloadDTO } from './contracts/auth-jwt-payload.dto';
import { AuthJwtAccessDTO, AuthJwtVerifyDTO } from './contracts/auth-jwt-access.dto';
export interface AccountRecord {
    login: string;
    email: string;
    email_verify: boolean;
    passwd: string;
}
export interface AccountRegistration {
    login: string;
    email: string;
    passwd: string;
    game_password_hash: string;
    referral_code: string;
    referral_parent?: string;
    ip: string;
    userAgent: string;
    email_verify: boolean;
    auth_ok: number;
    block: number;
}
export interface IdentityRepository {
    find(loginOrEmail: string): Promise<AccountRecord | null>;
    exists(email: string, login: string): Promise<boolean>;
    replacePassword(email: string, previousHash: string, passwordHash: string, gameHash: string): Promise<boolean>;
    verifyEmail(email: string, state: { email_verify: boolean; auth_ok: number; block: number }): Promise<void>;
    recordSession(login: string, ip: string, userAgent?: string): Promise<void>;
    rewardReferral(code: string): Promise<void>;
    register(account: AccountRegistration): Promise<void>;
}
export interface CredentialPort {
    hash(password: string): string;
    compare(password: string, hash: string): Promise<boolean>;
    version(hash: string): string;
    referralCode(): string;
}
export interface TokenPort {
    generateAccessToken(payload: AuthJwtPayloadDTO): Promise<AuthJwtAccessDTO>;
    generateVerifyToken(payload: AuthJwtPayloadDTO, purpose: 'email-verification' | 'password-reset'): Promise<AuthJwtVerifyDTO>;
}
export interface IdentityNotifications {
    verification(email: string, token: string): Promise<void>;
    passwordReset(email: string, token: string): Promise<void>;
}
