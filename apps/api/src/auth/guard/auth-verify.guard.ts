import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthBaseGuard } from './auth-base.guard';
import { AuthJwtTokenType } from '#Auth/type';

@Injectable()
export class AuthVerifyGuard extends AuthBaseGuard {
    protected tokenType = AuthJwtTokenType.VERIFY;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);
        const purpose = Reflect.getMetadata('verifyPurpose', context.getHandler());
        const { user } = context.switchToHttp().getRequest();
        if (!purpose || user.purpose !== purpose) {
            throw new UnauthorizedException();
        }
        return true;
    }
}
