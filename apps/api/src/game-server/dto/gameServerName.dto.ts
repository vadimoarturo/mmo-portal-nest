import { IsEnum } from 'class-validator';
import { GameServerName } from '../../common/enum';

export class GameServerNameDTO {
    @IsEnum(GameServerName)
    readonly serverName: GameServerName;
}
