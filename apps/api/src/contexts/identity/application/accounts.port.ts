export interface AccountSummary {
    email_verify: boolean;
    login: string;
    account_id: number;
    current_balance: string;
}
export interface AccountsPort {
    checkUser(login: string): Promise<AccountSummary>;
}
