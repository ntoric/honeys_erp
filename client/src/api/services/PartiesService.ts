import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { PartiesStats } from '../models/PartiesStats';
import type { Party } from '../models/Party';

export class PartiesService {
    /**
     * List all parties
     */
    public static getParties(
        party_type?: 'customer' | 'vendor',
        search?: string,
        category?: string,
    ): CancelablePromise<{
        data?: Array<Party>;
        stats?: PartiesStats;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/parties',
            query: {
                'party_type': party_type,
                'search': search,
                'category': category,
            },
        });
    }

    /**
     * Create or update party
     */
    public static postParties(
        requestBody: Party,
    ): CancelablePromise<Party> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/parties',
            body: requestBody,
        });
    }

    /**
     * Update party
     */
    public static putParties(
        id: string,
        requestBody: Party,
    ): CancelablePromise<Party> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/parties/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
        });
    }

    /**
     * Delete party
     */
    public static deleteParties(
        id: string,
    ): CancelablePromise<{
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/parties/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Perform bulk actions on parties
     */
    public static postPartiesBulkAction(
        requestBody: {
            action?: 'block' | 'unblock' | 'disable' | 'enable' | 'delete' | 'export';
            ids?: Array<string>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/parties/bulk-action',
            body: requestBody,
        });
    }
}
