import { GameServerName } from "../../enum";

export interface ShopBuyDTO {
  readonly itemId: number;
  readonly count: number;
  readonly serverName: GameServerName;
}
