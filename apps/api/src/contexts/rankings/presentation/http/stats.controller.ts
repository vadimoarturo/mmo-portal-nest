import { Controller, Get } from '@nestjs/common';
import { Rankings } from '../../application/rankings';
import { TopPksDTO, TopGuildsDTO, TopPlayersDTO } from '#Root/contexts/rankings/presentation/http/dto/stats.dto';

@Controller('top')
export class StatsController {
    constructor(private readonly statsService: Rankings) {}

    @Get('players')
    async getTopPlayers(): Promise<TopPlayersDTO[]> {
        return await this.statsService.getTopPlayers();
    }

    @Get('pks')
    async getTopPk(): Promise<TopPksDTO[]> {
        return await this.statsService.getTopPk();
    }

    @Get('guilds')
    async getTopGuilds(): Promise<TopGuildsDTO[]> {
        return await this.statsService.getTopGuilds();
    }
}
