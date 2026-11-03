import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '#Auth/auth.service';
import { JwtTokenService } from '#Auth/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthValidateLocalStrategy } from '#Auth/strategie/auth-validate-local.strategy';

@Module({
    imports: [JwtModule.register({})],
    providers: [AuthService, JwtTokenService, AuthValidateLocalStrategy],
    controllers: [AuthController],
    exports: [JwtTokenService],
})
export class AuthModule {}
