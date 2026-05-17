/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EWayBillRequest = {
    invoice_id: string;
    transporter_id?: string;
    transport_doc_no?: string;
    transport_doc_date?: string;
    vehicle_no?: string;
    vehicle_type?: EWayBillRequest.vehicle_type;
    distance_km?: number;
    supply_type?: string;
    sub_supply_type?: string;
};
export namespace EWayBillRequest {
    export enum vehicle_type {
        R = 'R',
        O = 'O',
    }
}

