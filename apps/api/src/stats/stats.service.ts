import { TopGuildsDTO, TopPksDTO, TopPlayersDTO } from './dto/stats.dto';
import { GameServerName } from '#Common/enum';
import { CacheService } from '#Core/cache/cache.service';
import { GameServerFactory } from '#GameServer/game-server.factory';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StatsService implements OnModuleInit {
    constructor(
        private readonly cacheService: CacheService,
        private readonly gameServerFactory: GameServerFactory,
    ) {}

    async onModuleInit() {
        await this.setStats();
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async setStats() {
        const topPlayers = await this.gameServerFactory.getService(GameServerName.MMO).getTopPlayers(25);
        await this.cacheService.setDataCache(topPlayers, 'topPlayers');

        const topPk = await this.gameServerFactory.getService(GameServerName.MMO).getTopPks(25);
        await this.cacheService.setDataCache(topPk, 'topPk');

        const topGuilds = await this.gameServerFactory.getService(GameServerName.MMO).getTopGuilds(25);
        await this.cacheService.setDataCache(topGuilds, 'topGuilds');
    }

    async getTopPlayers(): Promise<TopPlayersDTO[]> {
        return await this.cacheService.getDataCache('topPlayers');
    }

    async getTopPk(): Promise<TopPksDTO[]> {
        return await this.cacheService.getDataCache('topPk');
    }

    async getTopGuilds(): Promise<TopGuildsDTO[]> {
        return await this.cacheService.getDataCache('topGuilds');
    }
}
