/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * User login
     * @param requestBody
     * @returns LoginResponse Login successful
     * @throws ApiError
     */
    public static postAuthLogin(
        requestBody: LoginRequest,
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Logout & invalidate token
     * @returns any Logged out
     * @throws ApiError
     */
    public static postAuthLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
        });
    }
    /**
     * Refresh access token
     * @param requestBody
     * @returns LoginResponse New access token
     * @throws ApiError
     */
    public static postAuthRefresh(
        requestBody: {
            refresh_token?: string;
        },
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Change current user password
     * @param requestBody
     * @returns any Password updated
     * @throws ApiError
     */
    public static postAuthChangePassword(
        requestBody: {
            old_password: string;
            new_password: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/change-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Initiate password reset (OTP via SMS/email)
     * @param requestBody
     * @returns any OTP sent
     * @throws ApiError
     */
    public static postAuthForgotPassword(
        requestBody: {
            email?: string;
            phone?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Reset password using OTP
     * @param requestBody
     * @returns any Password reset successful
     * @throws ApiError
     */
    public static postAuthResetPassword(
        requestBody: {
            otp: string;
            new_password: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get current logged-in user profile
     * @returns User OK
     * @throws ApiError
     */
    public static getAuthMe(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/me',
        });
    }
}
