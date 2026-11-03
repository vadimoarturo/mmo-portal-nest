import { GameServerName } from '#Common/enum';

export interface IBuyShopItem {
    readonly login: string;
    readonly itemId: number;
    readonly count: number;
    readonly serverName: GameServerName;
}
