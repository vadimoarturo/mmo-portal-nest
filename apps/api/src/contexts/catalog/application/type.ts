import { GameServerName } from '#Root/shared/domain/enum/index';

export interface IBuyShopItem {
    readonly login: string;
    readonly itemId: number;
    readonly count: number;
    readonly serverName: GameServerName;
}
