import { Injectable } from '@nestjs/common';
import { AuthBaseGuard } from './auth-base.guard';
import { AuthJwtTokenType } from '#Auth/type';

@Injectable()
export class AuthAccessGuard extends AuthBaseGuard {
    protected tokenType = AuthJwtTokenType.ACCESS;
}
