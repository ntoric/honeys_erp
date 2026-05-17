/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WeighingReading } from '../models/WeighingReading';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WeighingMachineService {
    /**
     * List registered weighing devices
     * @returns any Devices
     * @throws ApiError
     */
    public static getWeighingDevices(): CancelablePromise<Array<{
        id?: string;
        name?: string;
        outlet_id?: string;
        model?: string;
        port?: string;
        baud_rate?: number;
        is_active?: boolean;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/weighing/devices',
        });
    }
    /**
     * Register weighing device
     * @param requestBody
     * @returns any Registered
     * @throws ApiError
     */
    public static postWeighingDevices(
        requestBody: {
            name?: string;
            outlet_id?: string;
            model?: string;
            port?: string;
            baud_rate?: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/weighing/devices',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Read current weight from device
     * @param id
     * @returns WeighingReading Current weight reading
     * @throws ApiError
     */
    public static getWeighingDevicesRead(
        id: string,
    ): CancelablePromise<WeighingReading> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/weighing/devices/{id}/read',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Tare (zero) the scale
     * @param id
     * @returns any Tare executed
     * @throws ApiError
     */
    public static postWeighingDevicesTare(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/weighing/devices/{id}/tare',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Calibrate weighing device
     * @param id
     * @param requestBody
     * @returns any Calibrated
     * @throws ApiError
     */
    public static postWeighingDevicesCalibrate(
        id: string,
        requestBody: {
            known_weight_kg?: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/weighing/devices/{id}/calibrate',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Check device connection status
     * @param id
     * @returns any Status
     * @throws ApiError
     */
    public static getWeighingDevicesStatus(
        id: string,
    ): CancelablePromise<{
        connected?: boolean;
        last_reading_at?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/weighing/devices/{id}/status',
            path: {
                'id': id,
            },
        });
    }
}
