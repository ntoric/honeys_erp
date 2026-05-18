import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { Category } from '../models/Category';

export class CategoriesService {
    /**
     * List all categories
     */
    public static getCategories(
        flat?: boolean,
        parentId?: string,
    ): CancelablePromise<Array<Category>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/categories',
            query: {
                'flat': flat,
                'parent_id': parentId,
            },
        });
    }

    /**
     * Create category
     */
    public static postCategories(
        requestBody: Category,
    ): CancelablePromise<Category> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/categories',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get category
     */
    public static getCategories1(
        id: string,
    ): CancelablePromise<Category> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/categories/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Update category
     */
    public static putCategories(
        id: string,
        requestBody: Category,
    ): CancelablePromise<Category> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/categories/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete category
     */
    public static deleteCategories(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/categories/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Bulk actions for categories
     */
    public static postCategoriesBulkAction(
        requestBody: {
            action: string;
            ids: Array<string>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/categories/bulk-action',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Bulk export categories as CSV
     */
    public static getCategoriesBulkExport(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/categories/bulk-export',
        });
    }
}
