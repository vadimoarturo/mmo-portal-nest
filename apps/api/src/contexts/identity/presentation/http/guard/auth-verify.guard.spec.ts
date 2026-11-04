import 'reflect-metadata';
import { AuthVerifyGuard } from '#Root/contexts/identity/presentation/http/guard/auth-verify.guard';
import { ExecutionContext } from '@nestjs/common';

it.each(['password-reset', 'email-verification'])('binds a verification JWT to its purpose: %s', async (purpose) => {
    const handler = () => {};
    Reflect.defineMetadata('verifyPurpose', purpose, handler);
    const jwt = { verifyJwt: jest.fn().mockResolvedValue({ purpose: purpose === 'password-reset' ? 'email-verification' : 'password-reset' }) };
    const request = { body: { token: 'token' } };
    const context = {
        getHandler: () => handler,
        switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({ clearCookie: jest.fn() }) }),
    } as unknown as ExecutionContext;
    await expect(new AuthVerifyGuard(jwt as never).canActivate(context)).rejects.toThrow();
});
