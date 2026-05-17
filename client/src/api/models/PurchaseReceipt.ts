/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseLineItem } from './PurchaseLineItem';
export type PurchaseReceipt = {
    id?: string;
    grn_no?: string;
    po_id?: string | null;
    outlet_id?: string;
    vendor_id?: string;
    receipt_date?: string;
    status?: PurchaseReceipt.status;
    items?: Array<(PurchaseLineItem & {
        batch_no?: string;
        mfg_date?: string;
        exp_date?: string;
    })>;
    bill_no?: string;
    bill_date?: string;
    grand_total?: number;
    created_at?: string;
};
export namespace PurchaseReceipt {
    export enum status {
        DRAFT = 'draft',
        SUBMITTED = 'submitted',
        CANCELLED = 'cancelled',
    }
}

