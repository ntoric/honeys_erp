/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type POSConfig = {
    default_payment_mode?: POSConfig.default_payment_mode;
    print_receipt_on_save?: boolean;
    receipt_printer_type?: POSConfig.receipt_printer_type;
    allow_discount?: boolean;
    max_discount_pct?: number;
    require_customer?: boolean;
    enable_loyalty?: boolean;
    enable_weighing_machine?: boolean;
    weighing_machine_port?: string;
};
export namespace POSConfig {
    export enum default_payment_mode {
        CASH = 'cash',
        UPI = 'upi',
        CARD = 'card',
        CREDIT = 'credit',
    }
    export enum receipt_printer_type {
        A4 = 'a4',
        THERMAL_2INCH = 'thermal_2inch',
        THERMAL_3INCH = 'thermal_3inch',
    }
}

