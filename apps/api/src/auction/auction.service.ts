import { Injectable } from '@nestjs/common';
import { PrismaService } from '#Core/prisma/prisma.service';
import { GameServerFactory } from '#GameServer/game-server.factory';
import { ErrorCodeClient, GameServerName } from '#Common/enum';
import { ApiError } from '#Common/exception/error.exception';
import { UserService } from '#User/user.service';
import { BalanceService, money } from '#User/balance.service';
import { AuctionBuyLotDTO, AuctionCancelLotDTO, AuctionCreateLotDTO, AuctionLotsDTO, AuctionLotsGetDTO } from './dto/auction.dto';

@Injectable()
export class AuctionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gameServerFactory: GameServerFactory,
        private readonly userService: UserService,
        private readonly balanceService: BalanceService,
    ) {}

    private async check(accountId: number) {
        const existCharacter = await this.gameServerFactory.getService(GameServerName.MMO).checkExistCharacter(accountId);
        if (!existCharacter) {
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.CHARACTER_NOT_FOUND,
                message: 'Pls create character',
            });
        }
        const balance = await this.gameServerFactory.getService(GameServerName.MMO).getBalanceInGame(accountId);
        if (balance === undefined) {
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.STOCK_ROOM_NOT_OPEN,
                message: 'Stock room not open',
            });
        }
        const online = await this.gameServerFactory.getService(GameServerName.MMO).getOnlineCharacters(accountId);
        if (online) {
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.SELECT_CHARACTER_EXIT,
                message: 'Pls select character',
            });
        }
    }

    private async getNameMaxLevelCharacter(accountId: number) {
        const name = await this.gameServerFactory.getService(GameServerName.MMO).getNameMaxLevelCharacter(accountId);
        if (!name) {
            throw new ApiError({
                type: 'CLIENT',
                code: ErrorCodeClient.CHARACTER_NOT_FOUND,
                message: 'Pls create character',
            });
        }
        return name;
    }

    async buyLot({ id }: AuctionBuyLotDTO, loginBuyer: string) {
        const { account_id: accountId } = await this.userService.checkUser(loginBuyer);
        await this.check(accountId);
        return this.prisma.$transaction(async (tx) => {
            const lot = await tx.orderAuction.findUnique({ where: { id } });
            if (!lot || lot.status !== 'active') {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.AUCTION_LOT_NOT_FOUND });
            }
            if (lot.login === loginBuyer) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.AUCTION_LOT_OWN });
            }
            const claimed = await tx.orderAuction.updateMany({
                where: { id, status: 'active' },
                data: { status: 'completed', login_buy: loginBuyer, date_buy: new Date() },
            });
            if (claimed.count !== 1) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.AUCTION_LOT_NOT_FOUND });
            }
            await this.balanceService.decrement(loginBuyer, lot.credits, tx);
            await this.balanceService.increment(lot.login, lot.credits, 'auction', tx);
            await this.gameServerFactory.getService(lot.server_name as GameServerName).insertBalanceInGame(accountId, Number(lot.gold), tx);
            return true;
        });
    }

    async createLot({ gold, credits, serverName }: AuctionCreateLotDTO, login: string) {
        const amount = Number(gold);
        money(credits);
        if (!Number.isSafeInteger(amount) || amount < 1000000 || amount > 9000000000 || Number(credits) < 1) {
            throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.MIN_AMOUNT });
        }
        const { account_id: accountId } = await this.userService.checkUser(login);
        await this.check(accountId);
        const name = await this.getNameMaxLevelCharacter(accountId);
        return this.prisma.$transaction(async (tx) => {
            await this.gameServerFactory.getService(serverName).removeBalanceInGame(accountId, amount, tx);
            await tx.orderAuction.create({ data: { login, gold, credits, status: 'active', server_name: serverName, name } });
            return true;
        });
    }

    async getLots({ page, serverName }: AuctionLotsGetDTO): Promise<AuctionLotsDTO> {
        const LIMIT = 10;
        const SKIP = (page - 1) * LIMIT;

        const [lots, totalCount] = await Promise.all([
            this.prisma.orderAuction.findMany({
                where: { status: 'active', server_name: serverName },
                select: {
                    id: true,
                    name: true,
                    gold: true,
                    credits: true,
                },
                skip: SKIP,
                take: LIMIT,
                orderBy: { id: 'desc' },
            }),
            this.prisma.orderAuction.count({
                where: { status: 'active', server_name: serverName },
            }),
        ]);

        const totalPages = totalCount > 0 ? Math.ceil(totalCount / LIMIT) : 1;

        return {
            data: lots.map((lot) => ({
                id: lot.id,
                name: lot.name,
                gold: String(lot.gold),
                credits: String(lot.credits),
            })),
            totalPages,
            currentPage: page,
        };
    }

    async getMyLots({ page, serverName }: AuctionLotsGetDTO, login: string): Promise<AuctionLotsDTO> {
        const LIMIT = 5;
        const SKIP = (page - 1) * LIMIT;

        const [lots, totalCount] = await Promise.all([
            this.prisma.orderAuction.findMany({
                where: { login, status: 'active', server_name: serverName },
                select: {
                    id: true,
                    name: true,
                    gold: true,
                    credits: true,
                },
                skip: SKIP,
                take: LIMIT,
                orderBy: { id: 'desc' },
            }),
            this.prisma.orderAuction.count({
                where: { login, status: 'active', server_name: serverName },
            }),
        ]);

        const totalPages = totalCount > 0 ? Math.ceil(totalCount / LIMIT) : 1;

        return {
            data: lots.map((lot) => ({
                id: lot.id,
                name: lot.name,
                gold: String(lot.gold),
                credits: String(lot.credits),
            })),
            totalPages,
            currentPage: page,
        };
    }

    async cancelLot({ id }: AuctionCancelLotDTO, login: string): Promise<boolean> {
        const { account_id: accountId } = await this.userService.checkUser(login);
        await this.check(accountId);
        return this.prisma.$transaction(async (tx) => {
            const lot = await tx.orderAuction.findUnique({ where: { id } });
            if (!lot || lot.login !== login || lot.status !== 'active') {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.AUCTION_LOT_NOT_FOUND });
            }
            const claimed = await tx.orderAuction.updateMany({
                where: { id, login, status: 'active' },
                data: { status: 'canceled', date_closed: new Date() },
            });
            if (claimed.count !== 1) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.AUCTION_LOT_NOT_FOUND });
            }
            await this.gameServerFactory.getService(lot.server_name as GameServerName).insertBalanceInGame(accountId, Number(lot.gold), tx);
            return true;
        });
    }
}
