import { Injectable } from '@nestjs/common';
import { AuthBaseGuard } from '#Root/contexts/identity/presentation/http/guard/auth-base.guard';
import { AuthJwtTokenType } from '#Root/contexts/identity/application/type';

@Injectable()
export class AuthAccessGuard extends AuthBaseGuard {
    protected tokenType = AuthJwtTokenType.ACCESS;
}
