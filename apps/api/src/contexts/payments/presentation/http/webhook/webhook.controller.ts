import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { WebhookService } from '#Root/contexts/payments/presentation/http/webhook/webhook.service';
import { FreeKassaDTO } from '#Root/contexts/payments/infrastructure/providers/FreeKassa/dto';
import { FreeKassaGuard } from '#Root/contexts/payments/infrastructure/providers/FreeKassa/free-kassa.guard';
import { AnyPayGuard } from '#Root/contexts/payments/infrastructure/providers/AnyPay/any-pay.guard';
import { AnyPayDTO } from '#Root/contexts/payments/infrastructure/providers/AnyPay/dto';
import { EnotGuard } from '#Root/contexts/payments/infrastructure/providers/Enot/enot.guard';
import { EnotWebhookDTO } from '#Root/contexts/payments/infrastructure/providers/Enot/dto';

@Controller('webhook')
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) {}

    @UseGuards(FreeKassaGuard)
    @Post('freekassa')
    async freekassa(@Body() data: FreeKassaDTO) {
        return this.webhookService.freekassa(data);
    }

    @UseGuards(AnyPayGuard)
    @Post('anypay')
    async anypay(@Body() data: AnyPayDTO) {
        return this.webhookService.anypay(data);
    }

    @UseGuards(EnotGuard)
    @Post('enot')
    async enot(@Body() data: EnotWebhookDTO) {
        return this.webhookService.enot(data);
    }
}
