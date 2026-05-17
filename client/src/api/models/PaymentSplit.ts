/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PaymentSplit = {
    mode?: PaymentSplit.mode;
    amount?: number;
    reference_no?: string;
    bank_name?: string;
    upi_id?: string;
};
export namespace PaymentSplit {
    export enum mode {
        CASH = 'cash',
        CARD = 'card',
        UPI = 'upi',
        CHEQUE = 'cheque',
        CREDIT = 'credit',
        GIFT_CARD = 'gift_card',
        LOYALTY_POINTS = 'loyalty_points',
    }
}

