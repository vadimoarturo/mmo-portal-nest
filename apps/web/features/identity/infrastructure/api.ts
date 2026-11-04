import { requestService } from "@/core/services/api/request.service";
import { AuthSignInDTO } from "@/features/identity/contracts/auth-signin.dto";
import { AuthSignUpDTO } from "@/features/identity/contracts/auth-signup.dto";
import { AuthJwtAccessDTO } from "@/features/identity/contracts/auth-jwt-access.dto";
import { AuthChangePasswordDTO, AuthChangePasswordVerifyDTO } from "@/features/identity/contracts";
import { AuthVerifyEmailDTO } from "@/features/identity/contracts/auth-verify-email.dto";

export const identityApi = {
async logout() {
    return await requestService<null, boolean>({
      path: "/auth/logout",
      method: "POST",
    });
  },

async signIn(data: AuthSignInDTO) {
    return await requestService<AuthSignInDTO, AuthJwtAccessDTO>({
      path: "/auth/signin",
      method: "POST",
      data: data,
    });
  },

async signUp(data: AuthSignUpDTO) {
    return await requestService<AuthSignUpDTO, AuthJwtAccessDTO>({
      path: "/auth/signup",
      method: "POST",
      data: data,
    });
  },

async changePassword(data: AuthChangePasswordDTO): Promise<boolean> {
    return await requestService<AuthChangePasswordDTO, boolean>({
      path: "/auth/password/resend",
      method: "POST",
      data: data,
    });
  },

async verifyChangePassword(
    data: AuthChangePasswordVerifyDTO,
  ): Promise<AuthJwtAccessDTO> {
    return await requestService<AuthChangePasswordVerifyDTO, AuthJwtAccessDTO>({
      path: "/auth/verify/password",
      method: "POST",
      data: data,
    });
  },

async resendVerifyEmail(): Promise<boolean> {
    return await requestService<null, boolean>({
      path: "/auth/verify/email/resend",
      method: "GET",
    });
  },

async verifyEmail(data: AuthVerifyEmailDTO): Promise<AuthJwtAccessDTO> {
    return await requestService<AuthVerifyEmailDTO, AuthJwtAccessDTO>({
      path: "/auth/verify/email",
      method: "POST",
      data: data,
    });
  },
};
