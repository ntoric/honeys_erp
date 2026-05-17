import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { CancelablePromise } from '../core/CancelablePromise';

export interface SalesReturn {
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

export class SalesReturnService {
    public static getSalesReturns(partyId?: string): CancelablePromise<{ data: SalesReturn[], meta: any }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sales/returns',
            query: { party_id: partyId },
        });
    }

    public static postSalesReturns(body: SalesReturn): CancelablePromise<SalesReturn> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sales/returns',
            body: body,
        });
    }

    public static getSalesReturn(id: string): CancelablePromise<SalesReturn> {
        return __request(OpenAPI, {
            method: 'GET',
            url: `/sales/returns/${id}`,
        });
    }

    public static putSalesReturn(id: string, body: SalesReturn): CancelablePromise<SalesReturn> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: `/sales/returns/${id}`,
            body: body,
        });
    }

    public static deleteSalesReturn(id: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: `/sales/returns/${id}`,
        });
    }

    public static postBulkAction(action: string, ids: string[]): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sales/returns/bulk-action',
            body: { action, ids },
        });
    }
}
