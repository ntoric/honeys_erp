/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from './Address';
export type Customer = {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    gstin?: string;
    pan?: string;
    address?: Address;
    credit_limit?: number;
    outstanding_balance?: number;
    loyalty_points?: number;
    customer_group?: string;
    price_list?: string;
    notes?: string;
    is_active?: boolean;
    created_at?: string;
};

