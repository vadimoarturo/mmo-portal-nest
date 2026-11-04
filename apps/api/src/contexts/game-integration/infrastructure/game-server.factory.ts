import { DomainError } from '#Root/shared/domain/domain-error';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MmoGameServerService } from '#Root/contexts/game-integration/infrastructure/version/game-server-mmo.service';
import { ErrorCodeInternal, GameServerName } from '#Root/shared/domain/enum/index';

@Injectable()
export class GameServerFactory {
    constructor(private readonly moduleRef: ModuleRef) {}

    getService(gameServerName: GameServerName): MmoGameServerService {
        switch (gameServerName) {
            case GameServerName.MMO:
                return this.moduleRef.get(MmoGameServerService, { strict: false });
            default:
                throw new DomainError({
                    type: 'CLIENT',
                    code: ErrorCodeInternal.GAME_FACTORY,
                    message: gameServerName,
                });
        }
    }
}
