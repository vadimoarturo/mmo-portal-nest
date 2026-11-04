import { Injectable } from '@nestjs/common';
import { GameServerFactory } from './game-server.factory';
import { GamePort, ItemDelivery } from '../application/game.port';
import { GameServerName } from '#Root/shared/domain/enum/index';
import { TransactionContext } from '#Root/shared/application/transaction';
import { transactionClient } from '#Root/platform/prisma/unit-of-work';
@Injectable()
export class GameGateway implements GamePort {
    constructor(private readonly factory: GameServerFactory) {}
    async deliver(server: GameServerName, item: ItemDelivery, context: TransactionContext) {
        await this.factory.getService(server).insertItem(item, transactionClient(context));
    }
    async creditGold(server: GameServerName, account: number, gold: number, context: TransactionContext) {
        await this.factory.getService(server).insertBalanceInGame(account, gold, transactionClient(context));
    }
    async reserveGold(server: GameServerName, account: number, gold: number, context: TransactionContext) {
        await this.factory.getService(server).removeBalanceInGame(account, gold, transactionClient(context));
    }
    async characterState(server: GameServerName, account: number) {
        const game = this.factory.getService(server);
        return {
            exists: !!(await game.checkExistCharacter(account)),
            hasStorage: (await game.getBalanceInGame(account)) !== undefined,
            online: !!(await game.getOnlineCharacters(account)),
        };
    }
    async characterName(server: GameServerName, account: number) {
        return this.factory.getService(server).getNameMaxLevelCharacter(account);
    }
}
