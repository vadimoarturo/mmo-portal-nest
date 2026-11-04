import { TransactionContext } from '#Root/shared/application/transaction';
export interface WalletPort {
    increment(login: string, amount: string, method: 'pay' | 'auction' | 'refund', context?: TransactionContext): Promise<string>;
    decrement(login: string, amount: string, context?: TransactionContext): Promise<string>;
    getBalance(login: string): Promise<string>;
}
export interface WalletRepository {
    credit(login: string, amount: string, method: 'pay' | 'auction' | 'refund', context: TransactionContext): Promise<string>;
    debit(login: string, amount: string, context: TransactionContext): Promise<string>;
    balance(login: string): Promise<string>;
}
