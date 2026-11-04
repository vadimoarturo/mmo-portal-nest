export interface INotificationMail {
    readonly email: string;
    readonly template: 'verify-email' | 'change-password';
    readonly context?: { url: string };
}

export interface INotificationMailJob extends INotificationMail {
    readonly subject: string;
    readonly from: string;
}
