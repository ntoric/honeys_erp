import { db } from '@/lib/db';
import type { CancelablePromise } from '../core/CancelablePromise';

export class InventoryService {
    private static getActiveSection(): 'retail' | 'wholesale' {
        if (typeof window === 'undefined') return 'retail';
        return (localStorage.getItem('pos_active_section') as any) || 'retail';
    }

    /**
     * Get stock balance and summary
     */
    public static getInventoryBalance(
        outletId?: string,
        productId?: string,
        categoryId?: string,
        lowStockOnly?: boolean,
    ): CancelablePromise<any> {
        return (async () => {
            const section = this.getActiveSection();
            let collection = db.products.where('section').equals(section);

            if (categoryId) {
                collection = collection.filter(p => p.categoryId === categoryId);
            }

            const products = await collection.toArray();
            
            let totalValue = 0;
            let lowStockCount = 0;
            let expiringCount = 0;

            products.forEach(p => {
                totalValue += (p.stockQuantity || 0) * (p.purchasePrice || 0);
                if (p.lowStockWarning && (p.stockQuantity ?? 0) <= (p.lowStockQuantity || 0)) {
                    lowStockCount++;
                }
            });

            return {
                data: products as any,
                summary: {
                    total_value: totalValue,
                    low_stock_count: lowStockCount,
                    expiring_count: expiringCount
                }
            };
        })() as any;
    }

    /**
     * List stock ledger entries
     */
    public static getInventoryEntries(): CancelablePromise<any> {
        return Promise.resolve({ data: [], meta: { total: 0 } }) as any;
    }
}
