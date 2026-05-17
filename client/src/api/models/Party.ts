/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Party = {
    id?: string;
    name?: string;
    category?: string;
    mobile?: string;
    email?: string;
    gstin?: string;
    address?: string;
    party_type?: Party.party_type;
    balance?: number;
    is_blocked?: boolean;
    is_active?: boolean;
    created_at?: string;
};
export namespace Party {
    export enum party_type {
        CUSTOMER = 'customer',
        VENDOR = 'vendor',
    }
}

