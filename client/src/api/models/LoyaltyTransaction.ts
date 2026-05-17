/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LoyaltyTransaction = {
    id?: string;
    customer_id?: string;
    transaction_type?: LoyaltyTransaction.transaction_type;
    points?: number;
    reference_doc?: string;
    created_at?: string;
};
export namespace LoyaltyTransaction {
    export enum transaction_type {
        EARN = 'earn',
        REDEEM = 'redeem',
        EXPIRE = 'expire',
        ADJUST = 'adjust',
    }
}

