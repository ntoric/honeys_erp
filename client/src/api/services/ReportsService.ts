/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LedgerEntry } from '../models/LedgerEntry';
import type { SalesSummaryReport } from '../models/SalesSummaryReport';
import type { StockEntry } from '../models/StockEntry';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * Sales summary report
     * @param fromDate
     * @param toDate
     * @param outletId
     * @param groupBy
     * @returns SalesSummaryReport OK
     * @throws ApiError
     */
    public static getReportsSalesSummary(
        fromDate: string,
        toDate: string,
        outletId?: string,
        groupBy?: 'day' | 'week' | 'month' | 'outlet' | 'cashier',
    ): CancelablePromise<SalesSummaryReport> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/sales-summary',
            query: {
                'from_date': fromDate,
                'to_date': toDate,
                'outlet_id': outletId,
                'group_by': groupBy,
            },
        });
    }
    /**
     * Sales by product report
     * @param fromDate
     * @param toDate
     * @param categoryId
     * @param outletId
     * @returns any Product-wise sales
     * @throws ApiError
     */
    public static getReportsSalesByProduct(
        fromDate: string,
        toDate: string,
        categoryId?: string,
        outletId?: string,
    ): CancelablePromise<Array<{
        product_id?: string;
        product_name?: string;
        category?: string;
        qty_sold?: number;
        total_amount?: number;
        total_discount?: number;
        gross_profit?: number;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/sales-by-product',
            query: {
                'from_date': fromDate,
                'to_date': toDate,
                'category_id': categoryId,
                'outlet_id': outletId,
            },
        });
    }
    /**
     * Sales by category report
     * @param fromDate
     * @param toDate
     * @param outletId
     * @returns any Category-wise sales
     * @throws ApiError
     */
    public static getReportsSalesByCategory(
        fromDate: string,
        toDate: string,
        outletId?: string,
    ): CancelablePromise<Array<{
        category?: string;
        total_amount?: number;
        qty_sold?: number;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/sales-by-category',
            query: {
                'from_date': fromDate,
                'to_date': toDate,
                'outlet_id': outletId,
            },
        });
    }
    /**
     * Sales by customer report
     * @param fromDate
     * @param toDate
     * @returns any Customer-wise sales
     * @throws ApiError
     */
    public static getReportsSalesByCustomer(
        fromDate: string,
        toDate: string,
    ): CancelablePromise<Array<{
        customer_id?: string;
        customer_name?: string;
        total_invoices?: number;
        total_amount?: number;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/sales-by-customer',
            query: {
                'from_date': fromDate,
                'to_date': toDate,
            },
        });
    }
    /**
     * Sales by cashier / user report
     * @param fromDate
     * @param toDate
     * @param outletId
     * @returns any Cashier-wise performance
     * @throws ApiError
     */
    public static getReportsSalesByCashier(
        fromDate: string,
        toDate: string,
        outletId?: string,
    ): CancelablePromise<Array<{
        user_id?: string;
        user_name?: string;
        total_invoices?: number;
        total_amount?: number;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/sales-by-cashier',
            query: {
                'from_date': fromDate,
                'to_date': toDate,
                'outlet_id': outletId,
            },
        });
    }
    /**
     * Payment collection report (mode-wise)
     * @param fromDate
     * @param toDate
     * @param outletId
     * @returns number Collection by mode
     * @throws ApiError
     */
    public static getReportsPaymentCollection(
        fromDate: string,
        toDate: string,
        outletId?: string,
    ): CancelablePromise<Record<string, number>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/payment-collection',
            query: {
                'from_date': fromDate,
                'to_date': toDate,
                'outlet_id': outletId,
            },
        });
    }
    /**
     * Stock valuation report
     * @param asOfDate
     * @param outletId
     * @param categoryId
     * @returns any Stock valuation
     * @throws ApiError
     */
    public static getReportsStockValuation(
        asOfDate?: string,
        outletId?: string,
        categoryId?: string,
    ): CancelablePromise<{
        total_value?: number;
        items?: Array<{
            product_id?: string;
            product_name?: string;
            qty_on_hand?: number;
            valuation_rate?: number;
            total_value?: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/stock-valuation',
            query: {
                'as_of_date': asOfDate,
                'outlet_id': outletId,
                'category_id': categoryId,
            },
        });
    }
    /**
     * Stock movement report
     * @param fromDate
     * @param toDate
     * @param productId
     * @param outletId
     * @returns StockEntry Movement detail
     * @throws ApiError
     */
    public static getReportsStockMovement(
        fromDate: string,
        toDate: string,
        productId?: string,
        outletId?: string,
    ): CancelablePromise<Array<StockEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/stock-movement',
            query: {
                'product_id': productId,
                'from_date': fromDate,
                'to_date': toDate,
                'outlet_id': outletId,
            },
        });
    }
    /**
     * Low stock alert report
     * @param outletId
     * @returns any Low stock items
     * @throws ApiError
     */
    public static getReportsLowStock(
        outletId?: string,
    ): CancelablePromise<Array<{
        product_id?: string;
        product_name?: string;
        qty_on_hand?: number;
        reorder_level?: number;
        reorder_qty?: number;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/low-stock',
            query: {
                'outlet_id': outletId,
            },
        });
    }
    /**
     * Near-expiry batch report
     * @param withinDays
     * @param outletId
     * @returns any Near-expiry batches
     * @throws ApiError
     */
    public static getReportsExpiryAlert(
        withinDays: number = 30,
        outletId?: string,
    ): CancelablePromise<Array<{
        product_name?: string;
        batch_no?: string;
        exp_date?: string;
        qty_on_hand?: number;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/expiry-alert',
            query: {
                'within_days': withinDays,
                'outlet_id': outletId,
            },
        });
    }
    /**
     * Purchase summary report
     * @param fromDate
     * @param toDate
     * @param vendorId
     * @returns any Purchase summary
     * @throws ApiError
     */
    public static getReportsPurchaseSummary(
        fromDate: string,
        toDate: string,
        vendorId?: string,
    ): CancelablePromise<{
        total_orders?: number;
        total_amount?: number;
        total_tax?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/purchase-summary',
            query: {
                'from_date': fromDate,
                'to_date': toDate,
                'vendor_id': vendorId,
            },
        });
    }
    /**
     * Customer / vendor outstanding balance report
     * @param party_type
     * @param asOfDate
     * @returns any Party balances
     * @throws ApiError
     */
    public static getReportsPartyBalance(
        party_type: 'customer' | 'vendor',
        asOfDate?: string,
    ): CancelablePromise<Array<{
        party_id?: string;
        party_name?: string;
        total_invoiced?: number;
        total_paid?: number;
        balance_due?: number;
        overdue_amount?: number;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/party-balance',
            query: {
                'party_type': party_type,
                'as_of_date': asOfDate,
            },
        });
    }
    /**
     * Gross profit by product report
     * @param fromDate
     * @param toDate
     * @returns any Profitability
     * @throws ApiError
     */
    public static getReportsProfitByProduct(
        fromDate: string,
        toDate: string,
    ): CancelablePromise<Array<{
        product_id?: string;
        product_name?: string;
        qty_sold?: number;
        revenue?: number;
        cogs?: number;
        gross_profit?: number;
        gross_margin_pct?: number;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/profit-by-product',
            query: {
                'from_date': fromDate,
                'to_date': toDate,
            },
        });
    }
    /**
     * Discount given report
     * @param fromDate
     * @param toDate
     * @returns any Discount summary
     * @throws ApiError
     */
    public static getReportsDiscountAnalysis(
        fromDate: string,
        toDate: string,
    ): CancelablePromise<{
        total_discount?: number;
        discount_by_cashier?: Array<{
            cashier_name?: string;
            total_discount?: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/discount-analysis',
            query: {
                'from_date': fromDate,
                'to_date': toDate,
            },
        });
    }
    /**
     * Day book (all transactions for a day)
     * @param date
     * @param outletId
     * @returns LedgerEntry Day book entries
     * @throws ApiError
     */
    public static getReportsDayBook(
        date: string,
        outletId?: string,
    ): CancelablePromise<Array<LedgerEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/day-book',
            query: {
                'date': date,
                'outlet_id': outletId,
            },
        });
    }
    /**
     * Export any report to CSV/Excel/PDF
     * @param reportType
     * @param fromDate
     * @param toDate
     * @param format
     * @returns binary File download
     * @throws ApiError
     */
    public static getReportsExport(
        reportType: 'sales_summary' | 'sales_by_product' | 'stock_valuation' | 'party_balance' | 'gstr1' | 'gstr3b',
        fromDate?: string,
        toDate?: string,
        format: 'csv' | 'xlsx' | 'pdf' = 'xlsx',
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/export/{report_type}',
            path: {
                'report_type': reportType,
            },
            query: {
                'from_date': fromDate,
                'to_date': toDate,
                'format': format,
            },
        });
    }
}
