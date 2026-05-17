/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseLineItem } from './PurchaseLineItem';
export type PurchaseOrder = {
    id?: string;
    po_no?: string;
    outlet_id?: string;
    vendor_id?: string;
    order_date?: string;
    expected_delivery?: string;
    status?: PurchaseOrder.status;
    items?: Array<PurchaseLineItem>;
    subtotal?: number;
    total_tax?: number;
    grand_total?: number;
    notes?: string;
    created_at?: string;
};
export namespace PurchaseOrder {
    export enum status {
        DRAFT = 'draft',
        SUBMITTED = 'submitted',
        PARTIAL = 'partial',
        RECEIVED = 'received',
        CANCELLED = 'cancelled',
    }
}

