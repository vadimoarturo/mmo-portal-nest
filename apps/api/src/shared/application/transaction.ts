/** A transaction identity, owned by the infrastructure implementation. */
export abstract class TransactionContext {
    protected readonly transactionContext = true;
}
export interface UnitOfWork {
    run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T>;
}
