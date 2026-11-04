import { TransactionContext } from '#Root/shared/application/transaction';
import { GameServerName } from '#Root/shared/domain/enum/index';
import { AuctionLot } from '../domain/auction-lot';
import { AuctionLotsDTO, AuctionLotsGetDTO } from './contracts/auction.dto';
export interface AuctionRepository {
    find(id: number, context: TransactionContext): Promise<AuctionLot | null>;
    complete(id: number, buyer: string, context: TransactionContext): Promise<boolean>;
    cancel(id: number, owner: string, context: TransactionContext): Promise<boolean>;
    create(data: { login: string; gold: string; credits: string; server_name: GameServerName; name: string }, context: TransactionContext): Promise<void>;
}
export interface AuctionReadPort {
    getLots(query: AuctionLotsGetDTO): Promise<AuctionLotsDTO>;
    getMyLots(query: AuctionLotsGetDTO, login: string): Promise<AuctionLotsDTO>;
}
