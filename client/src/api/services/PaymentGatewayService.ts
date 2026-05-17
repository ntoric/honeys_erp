/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentGatewayService {
    /**
     * Initiate online payment (UPI / card / net banking)
     * @param requestBody
     * @returns any Payment initiated
     * @throws ApiError
     */
    public static postPaymentGatewayInitiate(
        requestBody: {
            invoice_id: string;
            amount: number;
            mode: 'upi' | 'card' | 'netbanking' | 'wallet';
            upi_id?: string;
            customer_phone?: string;
            redirect_url?: string;
        },
    ): CancelablePromise<{
        transaction_id?: string;
        payment_url?: string;
        /**
         * UPI QR code
         */
        qr_code_base64?: string;
        status?: 'pending' | 'initiated';
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payment-gateway/initiate',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get payment transaction status
     * @param transactionId
     * @returns any Transaction status
     * @throws ApiError
     */
    public static getPaymentGatewayStatus(
        transactionId: string,
    ): CancelablePromise<{
        transaction_id?: string;
        status?: 'pending' | 'success' | 'failed' | 'refunded';
        amount?: number;
        gateway_ref?: string;
        paid_at?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/payment-gateway/status/{transaction_id}',
            path: {
                'transaction_id': transactionId,
            },
        });
    }
    /**
     * Initiate payment refund
     * @param requestBody
     * @returns any Refund initiated
     * @throws ApiError
     */
    public static postPaymentGatewayRefund(
        requestBody: {
            transaction_id: string;
            amount: number;
            reason?: string;
        },
    ): CancelablePromise<{
        refund_id?: string;
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payment-gateway/refund',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Payment gateway webhook callback (public)
     * @param requestBody
     * @returns any Acknowledged
     * @throws ApiError
     */
    public static postPaymentGatewayWebhook(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payment-gateway/webhook',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get gateway configuration
     * @returns any Config
     * @throws ApiError
     */
    public static getPaymentGatewayConfig(): CancelablePromise<{
        gateway?: 'razorpay' | 'payu' | 'cashfree' | 'phonepe';
        upi_vpa?: string;
        is_active?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/payment-gateway/config',
        });
    }
    /**
     * Update gateway configuration
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putPaymentGatewayConfig(
        requestBody: {
            gateway?: string;
            api_key?: string;
            api_secret?: string;
            upi_vpa?: string;
            webhook_secret?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/payment-gateway/config',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
