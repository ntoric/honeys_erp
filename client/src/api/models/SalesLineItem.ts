/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SalesLineItem = {
    id?: string;
    product_id: string;
    variant_id?: string | null;
    product_name?: string;
    hsn_sac_code?: string;
    barcode?: string;
    qty: number;
    unit?: string;
    sale_price: number;
    mrp?: number;
    cost_price?: number;
    discount_pct?: number;
    discount_amount?: number;
    net_rate?: number;
    gst_rate?: number;
    gst_type?: SalesLineItem.gst_type;
    cgst_rate?: number;
    cgst_amount?: number;
    sgst_rate?: number;
    sgst_amount?: number;
    igst_rate?: number;
    igst_amount?: number;
    cess_rate?: number;
    cess_amount?: number;
    taxable_amount?: number;
    line_total?: number;
    batch_no?: string;
    serial_no?: string;
    /**
     * For weighable items
     */
    weight_kg?: number;
};
export namespace SalesLineItem {
    export enum gst_type {
        INCLUSIVE = 'inclusive',
        EXCLUSIVE = 'exclusive',
    }
}

