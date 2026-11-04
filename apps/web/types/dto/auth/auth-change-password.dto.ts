export interface AuthChangePasswordDTO {
  email: string;
}

export interface AuthChangePasswordVerifyDTO {
  password: string;
  token: string;
}
