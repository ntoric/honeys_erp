/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WeighingReading = {
    device_id?: string;
    weight_kg?: number;
    unit?: WeighingReading.unit;
    stable?: boolean;
    timestamp?: string;
};
export namespace WeighingReading {
    export enum unit {
        KG = 'kg',
        G = 'g',
        LB = 'lb',
    }
}

