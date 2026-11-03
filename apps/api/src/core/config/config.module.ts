import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import config, { validationSchema } from './config';
import { ConfigService } from './config.service';

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
