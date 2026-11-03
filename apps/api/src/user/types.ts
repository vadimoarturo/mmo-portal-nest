import { GameServerName } from '#Common/enum';

export interface IUserBuy {
    readonly email: string;
    readonly gameItemId: string;
    readonly itemId: number;
    readonly itemCount: number;
    readonly count: number;
    readonly itemPrice: string;
    readonly serverName: GameServerName;
}
