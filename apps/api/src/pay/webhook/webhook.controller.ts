import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { FreeKassaDTO } from '../providers/FreeKassa/dto';
import { FreeKassaGuard } from '#Pay/providers/FreeKassa/free-kassa.guard';
import { AnyPayGuard } from '#Pay/providers/AnyPay/any-pay.guard';
import { AnyPayDTO } from '#Pay/providers/AnyPay/dto';
import { EnotGuard } from '#Pay/providers/Enot/enot.guard';
import { EnotWebhookDTO } from '#Pay/providers/Enot/dto';

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
