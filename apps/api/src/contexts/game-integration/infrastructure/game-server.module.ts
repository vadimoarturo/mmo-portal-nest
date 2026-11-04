import { GameGateway } from './game.gateway';
import { Module } from '@nestjs/common';
import { MmoGameServerService } from '#Root/contexts/game-integration/infrastructure/version/game-server-mmo.service';
import { GameServerFactory } from '#Root/contexts/game-integration/infrastructure/game-server.factory';

@Module({
    providers: [MmoGameServerService, GameServerFactory, GameGateway],
    exports: [GameServerFactory, GameGateway],
})
export class GameServerModule {}
