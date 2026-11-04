import { Rankings } from './application/rankings';
import { Module } from '@nestjs/common';
import { StatsService } from '#Root/contexts/rankings/infrastructure/stats.service';
import { StatsController } from '#Root/contexts/rankings/presentation/http/stats.controller';

@Module({
    providers: [StatsService, { provide: Rankings, inject: [StatsService], useFactory: (projection: StatsService) => new Rankings(projection) }],
    controllers: [StatsController],
    exports: [StatsService],
})
export class StatsModule {}
