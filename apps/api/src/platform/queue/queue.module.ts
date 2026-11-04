import { ConfigModule } from '#Root/platform/config/config.module';
import { ConfigService } from '#Root/platform/config/config.service';
import { MAIL_QUEUE } from '#Root/platform/queue/constants';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import * as path from 'path';
import { QueueService } from '#Root/platform/queue/queue.service';
import { NotifyProcessor } from '#Root/platform/queue/queue.processor';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get('SMTP_HOST'),
                    port: config.get('SMTP_PORT'),
                    secure: config.get('SMTP_SECURE'),
                    auth: {
                        user: config.get('SMTP_USER'),
                        pass: config.get('SMTP_PASS'),
                    },
                },
                template: {
                    dir: path.join(__dirname, '/mail/'),
                    adapter: new HandlebarsAdapter(),
                },
            }),
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                redis: { host: config.get('REDIS_HOST'), port: config.get('REDIS_PORT') },
                defaultJobOptions: { removeOnComplete: true },
            }),
        }),
        BullModule.registerQueue({
            name: MAIL_QUEUE,
            defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 10000 }, removeOnComplete: true },
        }),
    ],
    providers: [QueueService, NotifyProcessor],
    exports: [QueueService],
})
export class QueueModule {}
