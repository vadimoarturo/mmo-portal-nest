import { Module } from '@nestjs/common';
import { MmoGameServerService } from './version/game-server-mmo.service';
import { GameServerFactory } from './game-server.factory';

@Module({
    providers: [MmoGameServerService, GameServerFactory],
    exports: [GameServerFactory],
})
export class GameServerModule {}
