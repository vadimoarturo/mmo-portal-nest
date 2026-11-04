import { AccountsPort } from './accounts.port';
export class UserService implements AccountsPort {
    constructor(private readonly accounts: AccountsPort) {}
    checkUser(login: string) {
        return this.accounts.checkUser(login);
    }
}
