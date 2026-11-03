import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service';
import { AuthJwtTokenType } from './type';
import { createHash } from 'node:crypto';

describe('Session revocation', () => {
    const original = { ...process.env };
    beforeEach(() => {
        process.env.JWT_SECRET_ACCESS = 'unit-test-access-secret-not-for-runtime';
        process.env.JWT_SECRET_REFRESH = 'unit-test-refresh-secret-not-for-runtime';
        process.env.JWT_SECRET_ACCESS_EXPIRESIN = '15m';
        process.env.JWT_SECRET_REFRESH_EXPIRESIN = '7d';
    });
    afterEach(() => {
        process.env = { ...original };
    });
    it('invalidates access and refresh tokens after the stored password changes', async () => {
        const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ passwd: 'new-password-hash', email_verify: true }) } };
        const service = new JwtTokenService(new JwtService(), prisma as never);
        const tokens = await service.generateAccessToken({
            email: 'player@example.com',
            login: 'player',
            isVerifyEmail: true,
            credentialVersion: createHash('sha256').update('old-password-hash').digest('hex'),
        });
        await expect(service.verifyJwt({ token: tokens.accessToken, type: AuthJwtTokenType.ACCESS })).rejects.toThrow();
        await expect(service.verifyJwt({ token: tokens.refreshToken, type: AuthJwtTokenType.REFRESH })).rejects.toThrow();
    });
    it('uses the current email verification state for a valid session', async () => {
        const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ passwd: 'hash', email_verify: true }) } };
        const service = new JwtTokenService(new JwtService(), prisma as never);
        const tokens = await service.generateAccessToken({
            email: 'player@example.com',
            login: 'player',
            isVerifyEmail: false,
            credentialVersion: createHash('sha256').update('hash').digest('hex'),
        });
        await expect(service.verifyJwt({ token: tokens.accessToken, type: AuthJwtTokenType.ACCESS })).resolves.toMatchObject({ isVerifyEmail: true });
    });
});
