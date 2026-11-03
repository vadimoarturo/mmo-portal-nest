import { IsEnum, IsNumber } from 'class-validator';
import { GameServerName } from '#Common/enum';

export class ShopBuyDTO {
    @IsNumber()
    readonly itemId: number;

    @IsNumber()
    readonly count: number;

    @IsEnum(GameServerName)
    readonly serverName: GameServerName;
}
