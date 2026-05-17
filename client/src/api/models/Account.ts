/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Account = {
    id?: string;
    name?: string;
    code?: string;
    account_type?: Account.account_type;
    parent_id?: string | null;
    is_group?: boolean;
    opening_balance?: number;
    current_balance?: number;
    currency?: string;
    is_active?: boolean;
};
export namespace Account {
    export enum account_type {
        ASSET = 'asset',
        LIABILITY = 'liability',
        EQUITY = 'equity',
        INCOME = 'income',
        EXPENSE = 'expense',
        BANK = 'bank',
        CASH = 'cash',
        RECEIVABLE = 'receivable',
        PAYABLE = 'payable',
        STOCK = 'stock',
        TAX = 'tax',
    }
}

