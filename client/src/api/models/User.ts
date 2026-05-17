/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type User = {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: User.role;
    outlet_ids?: Array<string>;
    is_active?: boolean;
    created_at?: string;
};
export namespace User {
    export enum role {
        ADMIN = 'admin',
        MANAGER = 'manager',
        CASHIER = 'cashier',
        ACCOUNTANT = 'accountant',
        VIEWER = 'viewer',
    }
}

