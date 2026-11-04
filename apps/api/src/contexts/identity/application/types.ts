import { GameServerName } from '#Root/shared/domain/enum/index';

export interface IUserBuy {
    readonly email: string;
    readonly gameItemId: string;
    readonly itemId: number;
    readonly itemCount: number;
    readonly count: number;
    readonly itemPrice: string;
    readonly serverName: GameServerName;
}
