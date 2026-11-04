import { PrismaIdentityRepository } from '../infrastructure/prisma-identity.repository';
import { BcryptCredentials } from '../infrastructure/bcrypt-credentials';
import { AuthService } from '#Root/contexts/identity/application/auth.service';
import { createHash } from 'node:crypto';
import { compare } from 'bcrypt';

function fixture() {
    const user = { email: 'player@example.com', login: 'player', passwd: 'previous-password-hash', email_verify: true };
    const prisma = { user: { findFirst: jest.fn().mockResolvedValue(user), updateMany: jest.fn().mockResolvedValue({ count: 1 }) } };
    const jwt = { generateAccessToken: jest.fn().mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }) };
    const service = new AuthService(jwt as never, new PrismaIdentityRepository(prisma as never), {} as never, new BcryptCredentials());
    return { service, prisma, user, version: createHash('sha256').update(user.passwd).digest('hex') };
}

describe('Password recovery', () => {
    it('updates website and game hashes without saving the plaintext password', async () => {
        const { service, prisma, version } = fixture();
        await service.changePassword('player@example.com', 'new-password', version);
        const { data } = prisma.user.updateMany.mock.calls[0][0];
        expect(await compare('new-password', data.passwd)).toBe(true);
        expect(await compare('new-password', data.game_password_hash)).toBe(true);
        expect(Object.values(data)).not.toContain('new-password');
    });
    it('rejects a recovery link issued before the password changed', async () => {
        const { service, prisma, user, version } = fixture();
        user.passwd = 'different-password-hash';
        await expect(service.changePassword(user.email, 'new-password', version)).rejects.toThrow();
        expect(prisma.user.updateMany).not.toHaveBeenCalled();
    });
    it('rejects a replay when another request already changed the credentials', async () => {
        const { service, prisma, version } = fixture();
        prisma.user.updateMany.mockResolvedValue({ count: 0 });
        await expect(service.changePassword('player@example.com', 'new-password', version)).rejects.toThrow();
    });
});
