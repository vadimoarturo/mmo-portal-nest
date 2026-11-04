import { IsEnum } from 'class-validator';
import { GameServerName } from '#Root/shared/domain/enum/index';

export class GameServerNameDTO {
    @IsEnum(GameServerName)
    readonly serverName: GameServerName;
}
