/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginationMeta } from '../models/PaginationMeta';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SettingsService {
    /**
     * Get invoice numbering sequences
     * @returns any Sequences
     * @throws ApiError
     */
    public static getSettingsInvoiceSequence(): CancelablePromise<Array<{
        doc_type?: string;
        prefix?: string;
        current_no?: number;
        reset_yearly?: boolean;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/invoice-sequence',
        });
    }
    /**
     * Update invoice numbering
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putSettingsInvoiceSequence(
        requestBody: Array<{
            doc_type?: string;
            prefix?: string;
            reset_yearly?: boolean;
        }>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/settings/invoice-sequence',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List invoice print templates
     * @returns any Templates
     * @throws ApiError
     */
    public static getSettingsInvoiceTemplates(): CancelablePromise<Array<{
        id?: string;
        name?: string;
        type?: 'a4' | 'thermal_2inch' | 'thermal_3inch';
        is_default?: boolean;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/invoice-templates',
        });
    }
    /**
     * Create / upload custom template
     * @param formData
     * @returns any Created
     * @throws ApiError
     */
    public static postSettingsInvoiceTemplates(
        formData: {
            name?: string;
            type?: string;
            html_file?: Blob;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/settings/invoice-templates',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * List configured tax rates
     * @returns any Tax rates
     * @throws ApiError
     */
    public static getSettingsTaxRates(): CancelablePromise<Array<{
        id?: string;
        name?: string;
        rate?: number;
        components?: Array<{
            tax_type?: 'CGST' | 'SGST' | 'IGST' | 'CESS';
            rate?: number;
        }>;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/tax-rates',
        });
    }
    /**
     * Create tax rate
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public static postSettingsTaxRates(
        requestBody: {
            name?: string;
            rate?: number;
            components?: Array<{
                tax_type?: string;
                rate?: number;
            }>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/settings/tax-rates',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List price lists
     * @returns any Price lists
     * @throws ApiError
     */
    public static getSettingsPriceLists(): CancelablePromise<Array<{
        id?: string;
        name?: string;
        currency?: string;
        is_buying?: boolean;
        is_selling?: boolean;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/price-lists',
        });
    }
    /**
     * Create price list
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public static postSettingsPriceLists(
        requestBody: {
            name?: string;
            is_buying?: boolean;
            is_selling?: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/settings/price-lists',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get prices in a price list
     * @param id
     * @returns any Item prices
     * @throws ApiError
     */
    public static getSettingsPriceListsItems(
        id: string,
    ): CancelablePromise<Array<{
        product_id?: string;
        variant_id?: string;
        price?: number;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/price-lists/{id}/items',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Set prices in price list
     * @param id
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putSettingsPriceListsItems(
        id: string,
        requestBody: Array<{
            product_id?: string;
            variant_id?: string;
            price?: number;
        }>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/settings/price-lists/{id}/items',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get loyalty program config
     * @returns any Loyalty config
     * @throws ApiError
     */
    public static getSettingsLoyaltyProgram(): CancelablePromise<{
        is_enabled?: boolean;
        points_per_rupee?: number;
        /**
         * Rupees per point
         */
        redemption_rate?: number;
        minimum_redemption?: number;
        expiry_days?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/loyalty-program',
        });
    }
    /**
     * Update loyalty program config
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putSettingsLoyaltyProgram(
        requestBody: {
            is_enabled?: boolean;
            points_per_rupee?: number;
            redemption_rate?: number;
            minimum_redemption?: number;
            expiry_days?: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/settings/loyalty-program',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get email (SMTP) settings
     * @returns any Email config
     * @throws ApiError
     */
    public static getSettingsEmail(): CancelablePromise<{
        host?: string;
        port?: number;
        username?: string;
        use_tls?: boolean;
        from_name?: string;
        from_email?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/email',
        });
    }
    /**
     * Update email settings
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putSettingsEmail(
        requestBody: {
            host?: string;
            port?: number;
            username?: string;
            password?: string;
            use_tls?: boolean;
            from_name?: string;
            from_email?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/settings/email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get SMS gateway settings
     * @returns any SMS config
     * @throws ApiError
     */
    public static getSettingsSms(): CancelablePromise<{
        provider?: 'msg91' | 'textlocal' | 'twilio' | 'kaleyra';
        sender_id?: string;
        api_key?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/sms',
        });
    }
    /**
     * Update SMS settings
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putSettingsSms(
        requestBody: {
            provider?: string;
            sender_id?: string;
            api_key?: string;
            template_id?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/settings/sms',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get WhatsApp API settings
     * @returns any WhatsApp config
     * @throws ApiError
     */
    public static getSettingsWhatsapp(): CancelablePromise<{
        provider?: 'meta_business' | 'twilio' | 'wati' | 'interakt';
        phone_number_id?: string;
        business_account_id?: string;
        access_token?: string;
        is_active?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/whatsapp',
        });
    }
    /**
     * Update WhatsApp settings
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putSettingsWhatsapp(
        requestBody: {
            provider?: string;
            phone_number_id?: string;
            business_account_id?: string;
            access_token?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/settings/whatsapp',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get GST portal / IRP credentials
     * @returns any GST credentials (masked)
     * @throws ApiError
     */
    public static getSettingsGstCredentials(): CancelablePromise<{
        gstin?: string;
        username?: string;
        irp_client_id?: string;
        einvoice_enabled?: boolean;
        ewaybill_enabled?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/gst-credentials',
        });
    }
    /**
     * Update GST credentials
     * @param requestBody
     * @returns any Updated
     * @throws ApiError
     */
    public static putSettingsGstCredentials(
        requestBody: {
            gstin?: string;
            username?: string;
            password?: string;
            irp_client_id?: string;
            irp_client_secret?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/settings/gst-credentials',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Trigger manual data backup
     * @returns any Backup initiated
     * @throws ApiError
     */
    public static postSettingsBackup(): CancelablePromise<{
        job_id?: string;
        backup_url?: string;
        started_at?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/settings/backup',
        });
    }
    /**
     * List available backups
     * @returns any Backups
     * @throws ApiError
     */
    public static getSettingsBackupList(): CancelablePromise<Array<{
        id?: string;
        created_at?: string;
        size_mb?: number;
        download_url?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/backup/list',
        });
    }
    /**
     * Get system audit log
     * @param userId
     * @param action
     * @param docType
     * @param fromDate
     * @param toDate
     * @param page
     * @param perPage
     * @returns any Audit entries
     * @throws ApiError
     */
    public static getSettingsAuditLog(
        userId?: string,
        action?: string,
        docType?: string,
        fromDate?: string,
        toDate?: string,
        page?: number,
        perPage?: number,
    ): CancelablePromise<{
        data?: Array<{
            id?: string;
            user_id?: string;
            user_name?: string;
            action?: 'create' | 'update' | 'delete' | 'submit' | 'cancel' | 'login' | 'logout';
            doc_type?: string;
            doc_id?: string;
            changes?: Record<string, any>;
            ip_address?: string;
            timestamp?: string;
        }>;
        meta?: PaginationMeta;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/audit-log',
            query: {
                'user_id': userId,
                'action': action,
                'doc_type': docType,
                'from_date': fromDate,
                'to_date': toDate,
                'page': page,
                'per_page': perPage,
            },
        });
    }
}
