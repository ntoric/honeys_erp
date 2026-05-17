/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from './Address';
import type { PaymentSplit } from './PaymentSplit';
import type { SalesLineItem } from './SalesLineItem';
export type SalesInvoice = {
    id?: string;
    invoice_no?: string;
    invoice_type?: SalesInvoice.invoice_type;
    outlet_id?: string;
    pos_session_id?: string;
    customer_id?: string | null;
    customer_name?: string;
    customer_phone?: string;
    customer_gstin?: string;
    billing_address?: Address;
    shipping_address?: Address;
    invoice_date?: string;
    due_date?: string;
    items?: Array<SalesLineItem>;
    discount_type?: SalesInvoice.discount_type;
    discount_value?: number;
    subtotal?: number;
    total_discount?: number;
    taxable_amount?: number;
    cgst_amount?: number;
    sgst_amount?: number;
    igst_amount?: number;
    cess_amount?: number;
    total_tax?: number;
    round_off?: number;
    grand_total?: number;
    paid_amount?: number;
    balance_due?: number;
    payment_mode?: SalesInvoice.payment_mode;
    payment_details?: Array<PaymentSplit>;
    status?: SalesInvoice.status;
    /**
     * e-Invoice IRN
     */
    irn?: string;
    irn_ack_no?: string;
    irn_ack_date?: string;
    eway_bill_no?: string;
    notes?: string;
    loyalty_points_earned?: number;
    loyalty_points_redeemed?: number;
    created_by?: string;
    created_at?: string;
};
export namespace SalesInvoice {
    export enum invoice_type {
        POS = 'pos',
        REGULAR = 'regular',
        CREDIT_NOTE = 'credit_note',
        PROFORMA = 'proforma',
        QUOTATION = 'quotation',
        DELIVERY_CHALLAN = 'delivery_challan',
    }
    export enum discount_type {
        PERCENT = 'percent',
        AMOUNT = 'amount',
    }
    export enum payment_mode {
        CASH = 'cash',
        CARD = 'card',
        UPI = 'upi',
        CREDIT = 'credit',
        SPLIT = 'split',
    }
    export enum status {
        DRAFT = 'draft',
        SUBMITTED = 'submitted',
        PAID = 'paid',
        PARTIALLY_PAID = 'partially_paid',
        UNPAID = 'unpaid',
        CANCELLED = 'cancelled',
    }
}

