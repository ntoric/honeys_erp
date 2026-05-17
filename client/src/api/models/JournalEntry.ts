/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JournalLine } from './JournalLine';
export type JournalEntry = {
    id?: string;
    voucher_no?: string;
    voucher_type?: JournalEntry.voucher_type;
    posting_date?: string;
    narration?: string;
    lines?: Array<JournalLine>;
    total_debit?: number;
    total_credit?: number;
    status?: JournalEntry.status;
    created_at?: string;
};
export namespace JournalEntry {
    export enum voucher_type {
        JOURNAL = 'journal',
        PAYMENT = 'payment',
        RECEIPT = 'receipt',
        CONTRA = 'contra',
        CREDIT_NOTE = 'credit_note',
        DEBIT_NOTE = 'debit_note',
    }
    export enum status {
        DRAFT = 'draft',
        SUBMITTED = 'submitted',
        CANCELLED = 'cancelled',
    }
}

