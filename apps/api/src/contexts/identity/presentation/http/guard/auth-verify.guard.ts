import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthBaseGuard } from '#Root/contexts/identity/presentation/http/guard/auth-base.guard';
import { AuthJwtTokenType } from '#Root/contexts/identity/application/type';

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
