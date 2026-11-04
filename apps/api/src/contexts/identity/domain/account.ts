import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/index';
import { InvalidCredentials } from '#Root/shared/domain/invalid-credentials';
export { InvalidCredentials } from '#Root/shared/domain/invalid-credentials';
export class Account {
    constructor(readonly data: Readonly<{ login: string; email: string; email_verify: boolean; passwd: string }>) {}
    static validatePassword(password: string) {
        if (!/^[\x20-\x7e]{8,64}$/.test(password)) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.ERROR_DTO_VALIDATION });
        }
    }
    static register(login: string, email: string, password: string) {
        Account.validatePassword(password);
        if (!/^[A-Za-z0-9]{4,15}$/.test(login) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.ERROR_DTO_VALIDATION });
        }
        return { login, email, email_verify: false, auth_ok: 0, block: 1 };
    }
    verifyEmail(tokenAlreadyVerified: boolean) {
        if (this.data.email_verify || tokenAlreadyVerified) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.EMAIL_ALREADY_VERIFIED });
        }
        return { email_verify: true, auth_ok: 1, block: 0 };
    }
    authorizeReset(providedVersion: string, currentVersion: string, password: string) {
        if (!providedVersion || providedVersion !== currentVersion) {
            throw new InvalidCredentials();
        }
        Account.validatePassword(password);
    }
}
