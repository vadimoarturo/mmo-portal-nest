import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthValidateLocalGuard extends AuthGuard('VALIDATE_LOCAL') {}
