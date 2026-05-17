/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EInvoiceResponse = {
    invoice_id?: string;
    irn?: string;
    ack_no?: string;
    ack_date?: string;
    signed_invoice?: string;
    signed_qr_code?: string;
    status?: EInvoiceResponse.status;
};
export namespace EInvoiceResponse {
    export enum status {
        GENERATED = 'generated',
        CANCELLED = 'cancelled',
    }
}

