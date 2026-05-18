import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { Product } from '../models/Product';

export class ProductsService {
    /**
     * List products
     */
    public static getProducts(
        q?: string,
        categoryId?: string,
        isActive?: boolean,
        isService?: boolean,
        lowStock?: boolean,
        page: number = 1,
        perPage: number = 20,
    ): CancelablePromise<{
        data: Array<Product>;
        meta: any;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products',
            query: {
                'q': q,
                'category_id': categoryId,
                'is_active': isActive,
                'is_service': isService,
                'low_stock': lowStock,
                'page': page,
                'per_page': perPage,
            },
        });
    }

    /**
     * Create product
     */
    public static postProducts(
        requestBody: Product,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update product
     */
    public static putProducts(
        id: string,
        requestBody: Product,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/products/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete product
     */
    public static deleteProducts(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/products/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Bulk actions for products
     */
    public static postProductsBulkAction(
        requestBody: {
            action: string;
            ids: Array<string>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products/bulk-action',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Bulk export products as CSV
     */
    public static getProductsBulkExport(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/bulk-export',
        });
    }
}
