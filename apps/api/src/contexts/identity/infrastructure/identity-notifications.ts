import { Injectable } from '@nestjs/common';
import { QueueService } from '#Root/platform/queue/queue.service';
import { IdentityNotifications } from '../application/identity.port';
@Injectable()
export class QueuedIdentityNotifications implements IdentityNotifications {
    constructor(private readonly queue: QueueService) {}
    async verification(email: string, token: string) {
        await this.queue.sendMail({ email, template: 'verify-email', context: { url: `${process.env.WEB_URL}/auth/email-verify?token=${token}` } });
    }
    async passwordReset(email: string, token: string) {
        await this.queue.sendMail({ email, template: 'change-password', context: { url: `${process.env.WEB_URL}/auth/password-change?token=${token}` } });
    }
}
