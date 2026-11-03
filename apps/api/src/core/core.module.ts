import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { HelperService } from './helper.service';
import { QueueModule } from './queue/queue.module';
import { AuthModule } from '#Auth/auth.module';
import { GameServerModule } from '#GameServer/game-server.module';

@Global()
@Module({
    imports: [PrismaModule, CacheModule, GameServerModule, QueueModule, AuthModule],
    providers: [HelperService],
    exports: [PrismaModule, CacheModule, GameServerModule, HelperService, QueueModule, AuthModule],
})
export class CoreModule {}
