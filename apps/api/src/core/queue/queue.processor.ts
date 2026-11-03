import { MAIL_QUEUE } from './constants';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { INotificationMailJob } from './type';
import { Logger } from '@nestjs/common';

@Processor(MAIL_QUEUE)
export class NotifyProcessor {
    private readonly logger = new Logger(NotifyProcessor.name);
    constructor(private readonly mailerService: MailerService) {}

    @Process({ name: 'mail', concurrency: 1 })
    async sendMail(job: Job<INotificationMailJob>) {
        const { email, template, subject, context, from } = job.data;
        try {
            await this.mailerService.sendMail({
                to: email,
                from: from,
                subject: subject,
                template: template,
                context: context,
            });
            return {};
        } catch (err) {
            this.logger.error(`Email delivery failed for job ${job.id}`);
            throw err;
        }
    }
}
