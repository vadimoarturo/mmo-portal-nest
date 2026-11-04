import { Injectable } from '@nestjs/common';
import { AuctionRepository } from '../application/auction.port';
import { AuctionLot } from '../domain/auction-lot';
import { GameServerName } from '#Root/shared/domain/enum/index';
import { TransactionContext } from '#Root/shared/application/transaction';
import { transactionClient } from '#Root/platform/prisma/unit-of-work';
@Injectable()
export class PrismaAuctionRepository implements AuctionRepository {
    async find(id: number, context: TransactionContext) {
        const lot = await transactionClient(context).orderAuction.findUnique({ where: { id } });
        return lot ? new AuctionLot({ ...lot, server_name: lot.server_name as GameServerName }) : null;
    }
    async complete(id: number, buyer: string, context: TransactionContext) {
        const result = await transactionClient(context).orderAuction.updateMany({
            where: { id, status: 'active' },
            data: { status: 'completed', login_buy: buyer, date_buy: new Date() },
        });
        return result.count === 1;
    }
    async cancel(id: number, login: string, context: TransactionContext) {
        const result = await transactionClient(context).orderAuction.updateMany({ where: { id, login, status: 'active' }, data: { status: 'canceled', date_closed: new Date() } });
        return result.count === 1;
    }
    async create(data: { login: string; gold: string; credits: string; server_name: GameServerName; name: string }, context: TransactionContext) {
        await transactionClient(context).orderAuction.create({ data: { ...data, status: 'active' } });
    }
}
