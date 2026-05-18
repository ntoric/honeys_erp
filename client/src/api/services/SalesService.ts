import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { SalesInvoice } from '../models/SalesInvoice';
import type { PaginationMeta } from '../models/PaginationMeta';

export class SalesService {
    /**
     * List sales invoices
     */
    public static getSalesInvoices(
        invoiceType?: string,
        status?: string,
        customerId?: string,
        outletId?: string,
        fromDate?: string,
        toDate?: string,
        q?: string,
        page: number = 1,
        perPage: number = 20,
    ): CancelablePromise<{
        data?: Array<SalesInvoice>;
        meta?: PaginationMeta;
        summary?: {
            total_sales: number;
            paid_amount: number;
            unpaid_amount: number;
            cancelled_count: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sales/invoices',
            query: {
                'invoice_type': invoiceType,
                'status': status,
                'customer_id': customerId,
                'outlet_id': outletId,
                'from_date': fromDate,
                'to_date': toDate,
                'q': q,
                'page': page,
                'per_page': perPage,
            },
        });
    }

    /**
     * Create sales invoice / POS bill
     */
    public static postSalesInvoices(
        requestBody: SalesInvoice,
    ): CancelablePromise<SalesInvoice> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sales/invoices',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get sales invoice by ID
     */
    public static getSalesInvoices1(
        id: string,
    ): CancelablePromise<SalesInvoice> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sales/invoices/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Update draft invoice
     */
    public static putSalesInvoices(
        id: string,
        requestBody: SalesInvoice,
    ): CancelablePromise<SalesInvoice> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/sales/invoices/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Soft delete invoice
     */
    public static deleteSalesInvoices(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/sales/invoices/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Cancel invoice (dedicated endpoint)
     */
    public static cancelSalesInvoice(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sales/invoices/{id}/cancel',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Bulk actions for sales invoices (Cancel/Delete)
     */
    public static postSalesInvoicesBulkAction(
        requestBody: {
            action: string;
            ids: Array<string>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sales/invoices/bulk-action',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Bulk export sales invoices as CSV
     */
    public static getSalesInvoicesBulkExport(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sales/invoices/bulk-export',
        });
    }

    /**
     * Download invoice as PDF
     */
    public static getSalesInvoicesPdf(
        id: string,
        template?: 'a4' | 'thermal_2inch' | 'thermal_3inch',
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sales/invoices/{id}/pdf',
            path: {
                'id': id,
            },
            query: {
                'template': template,
            },
        });
    }
}
