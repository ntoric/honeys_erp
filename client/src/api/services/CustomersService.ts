/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Customer } from '../models/Customer';
import type { LedgerEntry } from '../models/LedgerEntry';
import type { LoyaltyTransaction } from '../models/LoyaltyTransaction';
import type { PaginationMeta } from '../models/PaginationMeta';
import type { SalesInvoice } from '../models/SalesInvoice';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CustomersService {
    /**
     * List customers
     * @param q Search by name/phone/email
     * @param page
     * @param perPage
     * @returns any OK
     * @throws ApiError
     */
    public static getCustomers(
        q?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<{
        data?: Array<Customer>;
        meta?: PaginationMeta;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/customers',
            query: {
                'q': q,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Create customer
     * @param requestBody
     * @returns Customer Created
     * @throws ApiError
     */
    public static postCustomers(
        requestBody: Customer,
    ): CancelablePromise<Customer> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/customers',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get customer
     * @param id
     * @returns Customer OK
     * @throws ApiError
     */
    public static getCustomers1(
        id: string,
    ): CancelablePromise<Customer> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/customers/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update customer
     * @param id
     * @param requestBody
     * @returns Customer OK
     * @throws ApiError
     */
    public static putCustomers(
        id: string,
        requestBody: Customer,
    ): CancelablePromise<Customer> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/customers/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Deactivate customer
     * @param id
     * @returns any Deactivated
     * @throws ApiError
     */
    public static deleteCustomers(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/customers/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get customer account ledger
     * @param id
     * @param fromDate
     * @param toDate
     * @returns LedgerEntry Customer ledger
     * @throws ApiError
     */
    public static getCustomersLedger(
        id: string,
        fromDate?: string,
        toDate?: string,
    ): CancelablePromise<Array<LedgerEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/customers/{id}/ledger',
            path: {
                'id': id,
            },
            query: {
                'from_date': fromDate,
                'to_date': toDate,
            },
        });
    }
    /**
     * Get customer's sales invoices
     * @param id
     * @returns SalesInvoice Invoices
     * @throws ApiError
     */
    public static getCustomersInvoices(
        id: string,
    ): CancelablePromise<Array<SalesInvoice>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/customers/{id}/invoices',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get loyalty points balance & history
     * @param id
     * @returns any Loyalty info
     * @throws ApiError
     */
    public static getCustomersLoyalty(
        id: string,
    ): CancelablePromise<{
        balance?: number;
        history?: Array<LoyaltyTransaction>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/customers/{id}/loyalty',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Manual loyalty points adjustment
     * @param id
     * @param requestBody
     * @returns any Adjusted
     * @throws ApiError
     */
    public static postCustomersLoyaltyAdjust(
        id: string,
        requestBody: {
            points?: number;
            reason?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/customers/{id}/loyalty/adjust',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Send account statement via WhatsApp/email
     * @param id
     * @param requestBody
     * @returns any Sent
     * @throws ApiError
     */
    public static postCustomersSendStatement(
        id: string,
        requestBody: {
            channel?: 'whatsapp' | 'email' | 'sms';
            from_date?: string;
            to_date?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/customers/{id}/send-statement',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
