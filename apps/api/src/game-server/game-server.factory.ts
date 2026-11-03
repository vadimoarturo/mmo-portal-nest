import { ApiError } from '#Common/exception/error.exception';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MmoGameServerService } from './version/game-server-mmo.service';
import { ErrorCodeInternal, GameServerName } from '#Common/enum';

@Injectable()
export class GameServerFactory {
    constructor(private readonly moduleRef: ModuleRef) {}

    getService(gameServerName: GameServerName): MmoGameServerService {
        switch (gameServerName) {
            case GameServerName.MMO:
                return this.moduleRef.get(MmoGameServerService, { strict: false });
            default:
                throw new ApiError({
                    type: 'CLIENT',
                    code: ErrorCodeInternal.GAME_FACTORY,
                    message: gameServerName,
                });
        }
    }
}
