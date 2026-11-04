import { GameServerName } from '#Root/shared/domain/enum/index';
import { TransactionContext } from '#Root/shared/application/transaction';
export interface ItemDelivery {
    accountId: number;
    gameItemId?: number;
    gameItemSetId: string;
    isSet: boolean;
    count: number;
}
/** Anti-corruption boundary: no game schema or SQL clients escape this port. */
export interface GamePort {
    deliver(server: GameServerName, item: ItemDelivery, context: TransactionContext): Promise<void>;
    creditGold(server: GameServerName, account: number, gold: number, context: TransactionContext): Promise<void>;
    reserveGold(server: GameServerName, account: number, gold: number, context: TransactionContext): Promise<void>;
    characterState(server: GameServerName, account: number): Promise<{ exists: boolean; hasStorage: boolean; online: boolean }>;
    characterName(server: GameServerName, account: number): Promise<string | undefined>;
}
