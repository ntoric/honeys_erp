import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class InventoryService {
    /**
     * Get stock balance and summary
     */
    public static getInventoryBalance(
        outletId?: string,
        productId?: string,
        categoryId?: string,
        lowStockOnly?: boolean,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/inventory/balance',
            query: {
                'outlet_id': outletId,
                'product_id': productId,
                'category_id': categoryId,
                'low_stock_only': lowStockOnly,
            },
        });
    }

    /**
     * List stock ledger entries
     */
    public static getInventoryEntries(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/inventory/entries',
        });
    }
}
