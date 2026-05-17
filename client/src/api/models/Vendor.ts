/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from './Address';
import type { BankDetails } from './BankDetails';
export type Vendor = {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    gstin?: string;
    pan?: string;
    address?: Address;
    payment_terms?: string;
    credit_limit?: number;
    outstanding_balance?: number;
    bank_details?: BankDetails;
    is_active?: boolean;
    created_at?: string;
};

