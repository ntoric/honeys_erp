/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginationMeta } from '../models/PaginationMeta';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * List all users
     * @param role
     * @param isActive
     * @param page
     * @param perPage
     * @returns any List of users
     * @throws ApiError
     */
    public static getUsers(
        role?: string,
        isActive?: boolean,
        page?: number,
        perPage?: number,
    ): CancelablePromise<{
        data?: Array<User>;
        meta?: PaginationMeta;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users',
            query: {
                'role': role,
                'is_active': isActive,
                'page': page,
                'per_page': perPage,
            },
        });
    }
    /**
     * Create user
     * @param requestBody
     * @returns User Created
     * @throws ApiError
     */
    public static postUsers(
        requestBody: User,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get user by ID
     * @param id
     * @returns User OK
     * @throws ApiError
     */
    public static getUsers1(
        id: string,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update user
     * @param id
     * @param requestBody
     * @returns User OK
     * @throws ApiError
     */
    public static putUsers(
        id: string,
        requestBody: User,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Deactivate user
     * @param id
     * @returns any Deactivated
     * @throws ApiError
     */
    public static deleteUsers(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Assign outlets to user
     * @param id
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putUsersOutlets(
        id: string,
        requestBody: {
            outlet_ids?: Array<string>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{id}/outlets',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
