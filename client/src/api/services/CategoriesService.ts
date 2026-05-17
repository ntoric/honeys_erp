import { db, generateId } from '@/lib/db';
import type { Category } from '../models/Category';
import type { CancelablePromise } from '../core/CancelablePromise';

export class CategoriesService {
    private static getActiveSection(): 'retail' | 'wholesale' {
        if (typeof window === 'undefined') return 'retail';
        return (localStorage.getItem('pos_active_section') as any) || 'retail';
    }

    /**
     * List all categories
     */
    public static getCategories(): CancelablePromise<Array<Category>> {
        return (async () => {
            const section = this.getActiveSection();
            const items = await db.categories.where('section').equals(section).toArray();
            return items.map(item => ({
                ...item,
                is_active: item.isActive,
                created_at: item.createdAt,
                updated_at: item.updatedAt
            }));
        })() as any;
    }

    /**
     * Create category
     */
    public static postCategories(
        requestBody: Category,
    ): CancelablePromise<Category> {
        const now = new Date().toISOString();
        const item = {
            id: requestBody.id || generateId(),
            name: requestBody.name || '',
            sku: requestBody.sku || '',
            isActive: requestBody.is_active !== false,
            createdAt: now,
            updatedAt: now,
            section: this.getActiveSection(),
        };
        return db.categories.add(item as any).then(() => ({
            ...item,
            is_active: item.isActive,
            created_at: item.createdAt,
            updated_at: item.updatedAt
        })) as any;
    }

    /**
     * Get category
     */
    public static getCategories1(
        id: string,
    ): CancelablePromise<Category> {
        return (async () => {
            const item = await db.categories.get(id);
            if (!item) return null;
            return {
                ...item,
                is_active: item.isActive,
                created_at: item.createdAt,
                updated_at: item.updatedAt
            };
        })() as any;
    }

    /**
     * Update category
     */
    public static putCategories(
        id: string,
        requestBody: Category,
    ): CancelablePromise<Category> {
        const now = new Date().toISOString();
        const update: any = {
            name: requestBody.name,
            sku: requestBody.sku,
            isActive: requestBody.is_active !== false,
            updatedAt: now,
        };
        return db.categories.update(id, update).then(() => ({
            ...requestBody,
            updated_at: now
        })) as any;
    }

    /**
     * Delete category
     */
    public static deleteCategories(
        id: string,
    ): CancelablePromise<void> {
        return db.categories.delete(id) as any;
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
        const { action, ids } = requestBody;
        const now = new Date().toISOString();

        if (action === 'delete') {
            return db.categories.bulkDelete(ids) as any;
        } else if (action === 'activate' || action === 'deactivate') {
            return db.categories.where('id').anyOf(ids).modify({ 
                isActive: action === 'activate',
                updatedAt: now
            }) as any;
        }
        return Promise.resolve() as any;
    }
}
