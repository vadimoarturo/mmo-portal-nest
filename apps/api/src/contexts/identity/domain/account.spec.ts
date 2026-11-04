import { Account } from './account';
describe('Account rules', () => {
    const data = { login: 'player', email: 'player@example.com', passwd: 'hash', email_verify: false };
    it('creates a blocked account pending verification', () =>
        expect(Account.register(data.login, data.email, 'password123')).toMatchObject({ block: 1, auth_ok: 0, email_verify: false }));
    it('unblocks the account when email is verified', () => expect(new Account(data).verifyEmail(false)).toEqual({ email_verify: true, auth_ok: 1, block: 0 }));
    it('rejects repeated verification', () => expect(() => new Account({ ...data, email_verify: true }).verifyEmail(false)).toThrow());
    it('rejects stale credential versions before accepting a password', () => expect(() => new Account(data).authorizeReset('old', 'current', 'new-password')).toThrow());
    it.each(['short', 'пароль12345', 'a'.repeat(65)])('enforces the password policy in the domain: %s', (password) =>
        expect(() => Account.register(data.login, data.email, password)).toThrow(),
    );
});
