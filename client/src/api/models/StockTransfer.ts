/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StockTransfer = {
    id?: string;
    from_outlet_id?: string;
    to_outlet_id?: string;
    status?: StockTransfer.status;
    items?: Array<{
        product_id?: string;
        variant_id?: string;
        qty?: number;
        batch_no?: string;
    }>;
    notes?: string;
    created_at?: string;
};
export namespace StockTransfer {
    export enum status {
        DRAFT = 'draft',
        SUBMITTED = 'submitted',
        RECEIVED = 'received',
        CANCELLED = 'cancelled',
    }
}

