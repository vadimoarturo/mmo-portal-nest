export interface AuthSignUpDTO {
    readonly password: string;

    readonly email: string;

    readonly login: string;

    readonly referralCode?: string;
}
