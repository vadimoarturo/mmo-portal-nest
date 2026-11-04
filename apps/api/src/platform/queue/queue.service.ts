import { MAIL_QUEUE } from '#Root/platform/queue/constants';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { INotificationMail, INotificationMailJob } from '#Root/platform/queue/type';

@Injectable()
export class QueueService {
    private readonly smtpUser = process.env.SMTP_USER;
    private readonly logger = new Logger(QueueService.name);

    constructor(@InjectQueue(MAIL_QUEUE) private readonly notifyQueue: Queue) {}

    async sendMail({ context, email, template }: INotificationMail) {
        let subject = 'Информация / Information';
        if (template === 'verify-email') {
            subject = 'Подтверждение почты / Email Verification';
        } else if (template === 'change-password') {
            subject = 'Смена пароля / Change Password';
        }
        const jobData: INotificationMailJob = {
            email: email,
            from: this.smtpUser,
            subject: subject,
            template: template,
            context: context ?? null,
        };
        const job = await this.notifyQueue.add('mail', jobData);
        this.logger.log(`Email queued: job ${job.id}`);
        return true;
    }
}
