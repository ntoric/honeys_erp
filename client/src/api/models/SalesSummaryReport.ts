/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SalesSummaryReport = {
    period_from?: string;
    period_to?: string;
    total_invoices?: number;
    total_sales?: number;
    total_returns?: number;
    net_sales?: number;
    total_discount?: number;
    total_tax?: number;
    total_cgst?: number;
    total_sgst?: number;
    total_igst?: number;
    cash_collected?: number;
    upi_collected?: number;
    card_collected?: number;
    credit_sales?: number;
    top_products?: Array<{
        product_id?: string;
        product_name?: string;
        qty_sold?: number;
        total_amount?: number;
    }>;
};

