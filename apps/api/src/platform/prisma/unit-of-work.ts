import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { TransactionContext, UnitOfWork } from '#Root/shared/application/transaction';
export class PrismaTransactionContext extends TransactionContext {
    constructor(readonly client: Prisma.TransactionClient) {
        super();
    }
}
export function transactionClient(context: TransactionContext): Prisma.TransactionClient {
    if (!(context instanceof PrismaTransactionContext)) {
        throw new Error('Unsupported transaction context');
    }
    return context.client;
}
@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
    constructor(private readonly prisma: PrismaService) {}
    run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T> {
        return this.prisma.$transaction((tx) => work(new PrismaTransactionContext(tx)));
    }
}
