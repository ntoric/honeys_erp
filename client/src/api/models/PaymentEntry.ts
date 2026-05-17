/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PaymentEntry = {
    id?: string;
    payment_no?: string;
    payment_type?: PaymentEntry.payment_type;
    party_type?: PaymentEntry.party_type;
    party_id?: string;
    payment_date?: string;
    mode?: PaymentEntry.mode;
    amount?: number;
    discount?: number;
    reference_no?: string;
    reference_date?: string;
    account_id?: string;
    allocations?: Array<{
        invoice_id?: string;
        allocated_amount?: number;
    }>;
    notes?: string;
    created_at?: string;
};
export namespace PaymentEntry {
    export enum payment_type {
        RECEIVE = 'receive',
        PAY = 'pay',
        INTERNAL_TRANSFER = 'internal_transfer',
    }
    export enum party_type {
        CUSTOMER = 'customer',
        VENDOR = 'vendor',
    }
    export enum mode {
        CASH = 'cash',
        BANK = 'bank',
        UPI = 'upi',
        CHEQUE = 'cheque',
        CARD = 'card',
    }
}

