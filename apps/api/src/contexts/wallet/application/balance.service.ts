import { WalletBalance } from '../domain/wallet-balance';
import { Money } from '#Root/shared/domain/money';
import { TransactionContext, UnitOfWork } from '#Root/shared/application/transaction';
import { WalletPort, WalletRepository } from './wallet.port';
export class BalanceService implements WalletPort {
    constructor(
        private readonly repository: WalletRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}
    increment(login: string, amount: string, method: 'pay' | 'auction' | 'refund', context?: TransactionContext) {
        const value = Money.parse(amount).toFixed();
        const apply = (tx: TransactionContext) => this.repository.credit(login, value, method, tx);
        return context ? apply(context) : this.unitOfWork.run(apply);
    }
    decrement(login: string, amount: string, context?: TransactionContext) {
        const value = Money.parse(amount).toFixed();
        const apply = (tx: TransactionContext) => this.repository.debit(login, value, tx);
        return context ? apply(context) : this.unitOfWork.run(apply);
    }
    async checkBalance(login: string, amount: string): Promise<boolean> {
        WalletBalance.restore(await this.getBalance(login)).requireFunds(Money.parse(amount));
        return true;
    }
    getBalance(login: string) {
        return this.repository.balance(login);
    }
}
