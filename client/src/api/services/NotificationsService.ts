/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationRequest } from '../models/NotificationRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * Send invoice / document via WhatsApp / SMS / Email
     * @param requestBody
     * @returns any Sent
     * @throws ApiError
     */
    public static postNotificationsSend(
        requestBody: NotificationRequest,
    ): CancelablePromise<{
        message_id?: string;
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notifications/send',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List message templates
     * @returns any Templates
     * @throws ApiError
     */
    public static getNotificationsTemplates(): CancelablePromise<Array<{
        id?: string;
        name?: string;
        channel?: string;
        language?: string;
        body?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notifications/templates',
        });
    }
    /**
     * Create message template
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public static postNotificationsTemplates(
        requestBody: {
            name?: string;
            channel?: 'whatsapp' | 'sms' | 'email';
            language?: string;
            body?: string;
            /**
             * For email only
             */
            subject?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notifications/templates',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update template
     * @param id
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putNotificationsTemplates(
        id: string,
        requestBody: {
            body?: string;
            subject?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/notifications/templates/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete template
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteNotificationsTemplates(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/notifications/templates/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get notification delivery logs
     * @param channel
     * @param status
     * @param fromDate
     * @param toDate
     * @param page
     * @param perPage
     * @returns any Notification logs
     * @throws ApiError
     */
    public static getNotificationsLogs(
        channel?: string,
        status?: 'sent' | 'failed' | 'pending',
        fromDate?: string,
        toDate?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<Array<{
        id?: string;
        channel?: string;
        recipient?: string;
        message?: string;
        status?: string;
        error?: string;
        sent_at?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notifications/logs',
            query: {
                'channel': channel,
                'status': status,
                'from_date': fromDate,
                'to_date': toDate,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Send payment reminders to overdue customers
     * @param requestBody
     * @returns any Reminders sent
     * @throws ApiError
     */
    public static postNotificationsPaymentReminder(
        requestBody: {
            /**
             * Send to customers overdue by N days
             */
            overdue_days?: number;
            channel?: 'whatsapp' | 'sms' | 'email';
            template_id?: string;
        },
    ): CancelablePromise<{
        sent_count?: number;
        failed_count?: number;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notifications/payment-reminder',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
