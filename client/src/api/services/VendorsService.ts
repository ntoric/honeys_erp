/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LedgerEntry } from '../models/LedgerEntry';
import type { PaginationMeta } from '../models/PaginationMeta';
import type { PurchaseOrder } from '../models/PurchaseOrder';
import type { Vendor } from '../models/Vendor';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VendorsService {
    /**
     * List vendors
     * @param q
     * @param page
     * @param perPage
     * @returns any OK
     * @throws ApiError
     */
    public static getVendors(
        q?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<{
        data?: Array<Vendor>;
        meta?: PaginationMeta;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/vendors',
            query: {
                'q': q,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Create vendor
     * @param requestBody
     * @returns Vendor Created
     * @throws ApiError
     */
    public static postVendors(
        requestBody: Vendor,
    ): CancelablePromise<Vendor> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/vendors',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get vendor
     * @param id
     * @returns Vendor OK
     * @throws ApiError
     */
    public static getVendors1(
        id: string,
    ): CancelablePromise<Vendor> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/vendors/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update vendor
     * @param id
     * @param requestBody
     * @returns Vendor OK
     * @throws ApiError
     */
    public static putVendors(
        id: string,
        requestBody: Vendor,
    ): CancelablePromise<Vendor> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/vendors/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Deactivate vendor
     * @param id
     * @returns any Deactivated
     * @throws ApiError
     */
    public static deleteVendors(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/vendors/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Vendor payable ledger
     * @param id
     * @param fromDate
     * @param toDate
     * @returns LedgerEntry Vendor ledger
     * @throws ApiError
     */
    public static getVendorsLedger(
        id: string,
        fromDate?: string,
        toDate?: string,
    ): CancelablePromise<Array<LedgerEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/vendors/{id}/ledger',
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
     * Get vendor's purchase orders
     * @param id
     * @returns PurchaseOrder POs
     * @throws ApiError
     */
    public static getVendorsPurchaseOrders(
        id: string,
    ): CancelablePromise<Array<PurchaseOrder>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/vendors/{id}/purchase-orders',
            path: {
                'id': id,
            },
        });
    }
}
