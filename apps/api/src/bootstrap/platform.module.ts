import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '#Root/platform/prisma/prisma.module';
import { CacheModule } from '#Root/platform/cache/cache.module';
import { HelperService } from '#Root/platform/helper.service';
import { QueueModule } from '#Root/platform/queue/queue.module';
import { GameServerModule } from '#Root/contexts/game-integration/infrastructure/game-server.module';

@Global()
@Module({
    imports: [PrismaModule, CacheModule, GameServerModule, QueueModule],
    providers: [HelperService],
    exports: [PrismaModule, CacheModule, GameServerModule, HelperService, QueueModule],
})
export class PlatformModule {}
