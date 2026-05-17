/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StockEntry = {
    id?: string;
    entry_type?: StockEntry.entry_type;
    product_id?: string;
    variant_id?: string | null;
    outlet_id?: string;
    batch_no?: string;
    serial_no?: string;
    qty?: number;
    unit_cost?: number;
    reference_doc?: string;
    notes?: string;
    created_by?: string;
    created_at?: string;
};
export namespace StockEntry {
    export enum entry_type {
        PURCHASE_RECEIPT = 'purchase_receipt',
        SALE = 'sale',
        ADJUSTMENT = 'adjustment',
        TRANSFER = 'transfer',
        OPENING = 'opening',
        DAMAGE = 'damage',
        RETURN = 'return',
    }
}

