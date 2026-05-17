/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Expense = {
    id?: string;
    expense_no?: string;
    date?: string;
    category_id?: string;
    category_name?: string;
    party_id?: string | null;
    party_name?: string;
    amount?: number;
    tax_inclusive?: boolean;
    original_invoice_no?: string;
    payment_mode?: string;
    notes?: string;
    status?: 'submitted' | 'cancelled';
    items?: Array<ExpenseItem>;
    receipt_url?: string;
    created_by?: string;
    created_at?: string;
};

export type ExpenseItem = {
    id?: string;
    description?: string;
    amount?: number;
};
