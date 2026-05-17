/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebhooksService {
    /**
     * List webhook subscriptions
     * @returns any Subscriptions
     * @throws ApiError
     */
    public static getWebhooksSubscriptions(): CancelablePromise<Array<{
        id?: string;
        url?: string;
        events?: Array<string>;
        secret?: string;
        is_active?: boolean;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/webhooks/subscriptions',
        });
    }
    /**
     * Create webhook subscription
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public static postWebhooksSubscriptions(
        requestBody: {
            url: string;
            events: Array<'invoice.created' | 'invoice.paid' | 'invoice.cancelled' | 'payment.received' | 'stock.low' | 'stock.updated' | 'customer.created' | 'purchase.received' | 'session.closed'>;
            secret?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/webhooks/subscriptions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update subscription
     * @param id
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putWebhooksSubscriptions(
        id: string,
        requestBody: {
            url?: string;
            events?: Array<string>;
            is_active?: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/webhooks/subscriptions/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete subscription
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteWebhooksSubscriptions(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/webhooks/subscriptions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Send test event to webhook URL
     * @param id
     * @returns any Test sent
     * @throws ApiError
     */
    public static postWebhooksSubscriptionsTest(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/webhooks/subscriptions/{id}/test',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get webhook delivery logs
     * @param subscriptionId
     * @param status
     * @param page
     * @returns any Logs
     * @throws ApiError
     */
    public static getWebhooksLogs(
        subscriptionId?: string,
        status?: 'delivered' | 'failed',
        page?: number,
    ): CancelablePromise<Array<{
        id?: string;
        event?: string;
        url?: string;
        status_code?: number;
        response?: string;
        delivered_at?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/webhooks/logs',
            query: {
                'subscription_id': subscriptionId,
                'status': status,
                'page': page,
            },
        });
    }
}
