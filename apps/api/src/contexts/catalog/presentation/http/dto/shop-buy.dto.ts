import { IsEnum, IsNumber } from 'class-validator';
import { GameServerName } from '#Root/shared/domain/enum/index';

export class ShopBuyDTO {
    @IsNumber()
    readonly itemId: number;

    @IsNumber()
    readonly count: number;

    @IsEnum(GameServerName)
    readonly serverName: GameServerName;
}
