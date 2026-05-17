/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationRequest = {
    channel: NotificationRequest.channel;
    invoice_id: string;
    recipient_phone?: string;
    recipient_email?: string;
    message_template?: string;
    attach_pdf?: boolean;
    language?: string;
};
export namespace NotificationRequest {
    export enum channel {
        WHATSAPP = 'whatsapp',
        SMS = 'sms',
        EMAIL = 'email',
    }
}

