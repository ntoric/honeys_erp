/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type POSSession = {
    id?: string;
    outlet_id?: string;
    cashier_id?: string;
    status?: POSSession.status;
    opening_cash?: number;
    closing_cash?: number;
    total_sales?: number;
    total_returns?: number;
    total_cash?: number;
    total_card?: number;
    total_upi?: number;
    total_credit?: number;
    opened_at?: string;
    closed_at?: string | null;
    closing_notes?: string;
};
export namespace POSSession {
    export enum status {
        OPEN = 'open',
        CLOSED = 'closed',
    }
}

