/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { POSSession } from '../models/POSSession';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PosService {
    /**
     * List POS sessions
     * @param outletId
     * @param cashierId
     * @param status
     * @param fromDate
     * @param toDate
     * @returns POSSession OK
     * @throws ApiError
     */
    public static getPosSessions(
        outletId?: string,
        cashierId?: string,
        status?: 'open' | 'closed',
        fromDate?: string,
        toDate?: string,
    ): CancelablePromise<Array<POSSession>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pos/sessions',
            query: {
                'outlet_id': outletId,
                'cashier_id': cashierId,
                'status': status,
                'from_date': fromDate,
                'to_date': toDate,
            },
        });
    }
    /**
     * Open a new POS session
     * @param requestBody
     * @returns POSSession Session opened
     * @throws ApiError
     */
    public static postPosSessions(
        requestBody: {
            outlet_id: string;
            opening_cash: number;
        },
    ): CancelablePromise<POSSession> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pos/sessions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get current active session for the logged-in cashier
     * @returns POSSession OK
     * @throws ApiError
     */
    public static getPosSessionsActive(): CancelablePromise<POSSession> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pos/sessions/active',
        });
    }
    /**
     * Get POS session
     * @param id
     * @returns POSSession OK
     * @throws ApiError
     */
    public static getPosSessions1(
        id: string,
    ): CancelablePromise<POSSession> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pos/sessions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Close POS session (end of day)
     * @param id
     * @param requestBody
     * @returns POSSession Session closed
     * @throws ApiError
     */
    public static postPosSessionsClose(
        id: string,
        requestBody: {
            closing_cash?: number;
            closing_notes?: string;
        },
    ): CancelablePromise<POSSession> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pos/sessions/{id}/close',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get Z-report / session summary
     * @param id
     * @returns any Z-report
     * @throws ApiError
     */
    public static getPosSessionsSummary(
        id: string,
    ): CancelablePromise<{
        session?: POSSession;
        total_invoices?: number;
        total_sales?: number;
        total_returns?: number;
        payment_breakdown?: Record<string, number>;
        top_products?: Array<{
            product_name?: string;
            qty?: number;
            amount?: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pos/sessions/{id}/summary',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get cash-in / cash-out movements for session
     * @param id
     * @returns any Cash movements
     * @throws ApiError
     */
    public static getPosSessionsCashMovements(
        id: string,
    ): CancelablePromise<Array<{
        type?: 'cash_in' | 'cash_out';
        amount?: number;
        reason?: string;
        created_at?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pos/sessions/{id}/cash-movements',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Record cash-in or cash-out
     * @param id
     * @param requestBody
     * @returns any Recorded
     * @throws ApiError
     */
    public static postPosSessionsCashMovements(
        id: string,
        requestBody: {
            type: 'cash_in' | 'cash_out';
            amount: number;
            reason?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pos/sessions/{id}/cash-movements',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
