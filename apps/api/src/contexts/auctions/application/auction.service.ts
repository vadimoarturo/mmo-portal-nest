import { TradingEligibility } from '../domain/trading-eligibility';
import { AuctionRepository, AuctionReadPort } from './auction.port';
import { AuctionLot } from '../domain/auction-lot';
import { AccountsPort } from '#Root/contexts/identity/application/accounts.port';
import { WalletPort } from '#Root/contexts/wallet/application/wallet.port';
import { GamePort } from '#Root/contexts/game-integration/application/game.port';
import { UnitOfWork } from '#Root/shared/application/transaction';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/index';
import { AuctionBuyLotDTO, AuctionCancelLotDTO, AuctionCreateLotDTO, AuctionLotsGetDTO } from './contracts/auction.dto';
export class AuctionService {
    constructor(
        private readonly repository: AuctionRepository,
        private readonly queries: AuctionReadPort,
        private readonly accounts: AccountsPort,
        private readonly wallet: WalletPort,
        private readonly game: GamePort,
        private readonly uow: UnitOfWork,
    ) {}
    private async check(accountId: number, server: AuctionCreateLotDTO['serverName']) {
        const state = await this.game.characterState(server, accountId);
        TradingEligibility.require(state);
    }
    async buyLot({ id }: AuctionBuyLotDTO, buyer: string) {
        const { account_id: account } = await this.accounts.checkUser(buyer);
        return this.uow.run(async (context) => {
            const lot = await this.repository.find(id, context);
            if (!lot) {
                AuctionLot.unavailable();
            }
            lot.buy(buyer);
            await this.check(account, lot.data.server_name);
            if (!(await this.repository.complete(id, buyer, context))) {
                AuctionLot.unavailable();
            }
            await this.wallet.decrement(buyer, lot.data.credits, context);
            await this.wallet.increment(lot.data.login, lot.data.credits, 'auction', context);
            await this.game.creditGold(lot.data.server_name, account, Number(lot.data.gold), context);
            return true;
        });
    }
    async createLot({ gold, credits, serverName }: AuctionCreateLotDTO, login: string) {
        const listing = AuctionLot.validateListing(gold, credits);
        const { account_id: account } = await this.accounts.checkUser(login);
        await this.check(account, serverName);
        const name = await this.game.characterName(serverName, account);
        if (!name) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.CHARACTER_NOT_FOUND });
        }
        return this.uow.run(async (context) => {
            await this.game.reserveGold(serverName, account, listing.gold, context);
            await this.repository.create({ login, gold, credits: listing.price.toFixed(), server_name: serverName, name }, context);
            return true;
        });
    }
    async cancelLot({ id }: AuctionCancelLotDTO, login: string) {
        const { account_id: account } = await this.accounts.checkUser(login);
        return this.uow.run(async (context) => {
            const lot = await this.repository.find(id, context);
            if (!lot) {
                AuctionLot.unavailable();
            }
            lot.cancel(login);
            await this.check(account, lot.data.server_name);
            if (!(await this.repository.cancel(id, login, context))) {
                AuctionLot.unavailable();
            }
            await this.game.creditGold(lot.data.server_name, account, Number(lot.data.gold), context);
            return true;
        });
    }
    getLots(query: AuctionLotsGetDTO) {
        return this.queries.getLots(query);
    }
    getMyLots(query: AuctionLotsGetDTO, login: string) {
        return this.queries.getMyLots(query, login);
    }
}
