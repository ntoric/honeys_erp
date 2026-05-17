import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { CancelablePromise } from '../core/CancelablePromise';

export interface PurchaseReturn {
    id?: string;
    return_no?: string;
    invoice_id?: string;
    invoice_no?: string;
    party_id?: string;
    party_name?: string;
    party_mobile?: string;
    return_date?: string;
    status?: string;
    subtotal?: number;
    taxable_amount?: number;
    total_tax?: number;
    total_discount?: number;
    round_off?: number;
    grand_total?: number;
    paid_amount?: number;
    balance_amount?: number;
    payment_method?: string;
    notes?: string;
    is_draft?: boolean;
    items?: Array<any>;
    charges?: Array<any>;
}

export class PurchaseReturnService {
    public static getPurchaseReturns(partyId?: string): CancelablePromise<{ data: PurchaseReturn[], meta: any }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/purchase/returns',
            query: { party_id: partyId },
        });
    }

    public static postPurchaseReturns(body: PurchaseReturn): CancelablePromise<PurchaseReturn> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/purchase/returns',
            body: body,
        });
    }

    public static getPurchaseReturn(id: string): CancelablePromise<PurchaseReturn> {
        return __request(OpenAPI, {
            method: 'GET',
            url: `/purchase/returns/${id}`,
        });
    }

    public static putPurchaseReturn(id: string, body: PurchaseReturn): CancelablePromise<PurchaseReturn> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: `/purchase/returns/${id}`,
            body: body,
        });
    }

    public static deletePurchaseReturn(id: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: `/purchase/returns/${id}`,
        });
    }

    public static postBulkAction(action: string, ids: string[]): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/purchase/returns/bulk-action',
            body: { action, ids },
        });
    }
}
