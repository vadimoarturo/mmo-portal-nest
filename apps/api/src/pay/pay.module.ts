import { Module } from '@nestjs/common';
import { ProvidersModule } from './providers/providers.module';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';
import { PayService } from './pay.service';
import { UserModule } from '#User/user.module';
import { PayController } from './pay.controller';

@Module({
    imports: [ProvidersModule, UserModule],
    controllers: [WebhookController, PayController],
    providers: [WebhookService, PayService],
    exports: [ProvidersModule],
})
export class PayModule {}
