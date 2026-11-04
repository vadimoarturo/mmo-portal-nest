import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import config, { validationSchema } from '#Root/platform/config/config';
import { ConfigService } from '#Root/platform/config/config.service';

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            load: [config],
            validationSchema,
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
