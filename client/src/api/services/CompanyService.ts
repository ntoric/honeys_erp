/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from '../models/Company';
import type { Outlet } from '../models/Outlet';
import type { POSConfig } from '../models/POSConfig';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompanyService {
    /**
     * Get company details
     * @returns Company OK
     * @throws ApiError
     */
    public static getCompany(): CancelablePromise<Company> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/company',
        });
    }
    /**
     * Update company details
     * @param requestBody
     * @returns Company OK
     * @throws ApiError
     */
    public static putCompany(
        requestBody: Company,
    ): CancelablePromise<Company> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/company',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Upload company logo
     * @param formData
     * @returns any Logo URL
     * @throws ApiError
     */
    public static postCompanyLogo(
        formData: {
            file?: Blob;
        },
    ): CancelablePromise<{
        logo_url?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/company/logo',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * List all outlets / branches
     * @returns Outlet OK
     * @throws ApiError
     */
    public static getOutlets(): CancelablePromise<Array<Outlet>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/outlets',
        });
    }
    /**
     * Create outlet
     * @param requestBody
     * @returns Outlet Created
     * @throws ApiError
     */
    public static postOutlets(
        requestBody: Outlet,
    ): CancelablePromise<Outlet> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/outlets',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get outlet by ID
     * @param id
     * @returns Outlet OK
     * @throws ApiError
     */
    public static getOutlets1(
        id: string,
    ): CancelablePromise<Outlet> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/outlets/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update outlet
     * @param id
     * @param requestBody
     * @returns Outlet OK
     * @throws ApiError
     */
    public static putOutlets(
        id: string,
        requestBody: Outlet,
    ): CancelablePromise<Outlet> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/outlets/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Deactivate outlet
     * @param id
     * @returns any Deactivated
     * @throws ApiError
     */
    public static deleteOutlets(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/outlets/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get POS config for outlet
     * @param id
     * @returns POSConfig OK
     * @throws ApiError
     */
    public static getOutletsPosConfig(
        id: string,
    ): CancelablePromise<POSConfig> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/outlets/{id}/pos-config',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update POS config for outlet
     * @param id
     * @param requestBody
     * @returns POSConfig OK
     * @throws ApiError
     */
    public static putOutletsPosConfig(
        id: string,
        requestBody: POSConfig,
    ): CancelablePromise<POSConfig> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/outlets/{id}/pos-config',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
