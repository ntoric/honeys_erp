import { db, generateId } from '@/lib/db';
import type { Product } from '../models/Product';
import type { CancelablePromise } from '../core/CancelablePromise';

export class ProductsService {
    private static getActiveSection(): 'retail' | 'wholesale' {
        if (typeof window === 'undefined') return 'retail';
        return (localStorage.getItem('pos_active_section') as any) || 'retail';
    }

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
        return (async () => {
            const section = this.getActiveSection();
            let collection = db.products.where('section').equals(section);

            if (q) {
                const search = q.toLowerCase();
                collection = collection.filter(p => 
                    !!(p.name?.toLowerCase().includes(search) || 
                       p.sku?.toLowerCase().includes(search) ||
                       (p.itemCode && p.itemCode.toLowerCase().includes(search)))
                );
            }

            if (categoryId) {
                collection = collection.filter(p => p.categoryId === categoryId);
            }

            if (isActive !== undefined) {
                collection = collection.filter(p => p.isActive === isActive);
            }

            const allItems = await collection.toArray();
            const total = allItems.length;
            const data = allItems.slice((page - 1) * perPage, page * perPage);

            const mappedData = data.map(p => ({
                ...p,
                product_type: p.productType,
                category_id: p.categoryId,
                item_code: p.itemCode,
                stock_quantity: p.stockQuantity,
                low_stock_warning: p.lowStockWarning,
                low_stock_quantity: p.lowStockQuantity,
                sale_price: p.salePrice,
                purchase_price: p.purchasePrice,
                is_active: p.isActive,
                is_draft: p.isDraft
            }));

            return {
                data: mappedData as any,
                meta: {
                    page,
                    per_page: perPage,
                    total,
                    total_pages: Math.ceil(total / perPage)
                }
            };
        })() as any;
    }

    /**
     * Create product
     */
    public static postProducts(
        requestBody: Product,
    ): CancelablePromise<Product> {
        const item = {
            ...requestBody,
            id: requestBody.id || generateId(),
            isActive: (requestBody as any).is_active !== false,
            productType: (requestBody as any).product_type || 'standard',
            categoryId: (requestBody as any).category_id,
            itemCode: (requestBody as any).item_code,
            stockQuantity: (requestBody as any).stock_quantity || 0,
            lowStockWarning: (requestBody as any).low_stock_warning,
            lowStockQuantity: (requestBody as any).low_stock_quantity || 0,
            salePrice: (requestBody as any).sale_price || 0,
            purchasePrice: (requestBody as any).purchase_price || 0,
            isDraft: (requestBody as any).is_draft || false,
            section: this.getActiveSection(),
        };
        return db.products.add(item as any).then(() => ({
            ...item,
            is_active: item.isActive,
            is_draft: item.isDraft
        })) as any;
    }

    /**
     * Update product
     */
    public static putProducts(
        id: string,
        requestBody: Product,
    ): CancelablePromise<Product> {
        const update: any = { ...requestBody };
        if ((requestBody as any).is_active !== undefined) update.isActive = (requestBody as any).is_active;
        if ((requestBody as any).product_type !== undefined) update.productType = (requestBody as any).product_type;
        if ((requestBody as any).category_id !== undefined) update.categoryId = (requestBody as any).category_id;
        if ((requestBody as any).item_code !== undefined) update.itemCode = (requestBody as any).item_code;
        if ((requestBody as any).stock_quantity !== undefined) update.stockQuantity = (requestBody as any).stock_quantity;
        if ((requestBody as any).sale_price !== undefined) update.salePrice = (requestBody as any).sale_price;
        if ((requestBody as any).purchase_price !== undefined) update.purchasePrice = (requestBody as any).purchase_price;
        
        return db.products.update(id, update).then(() => requestBody) as any;
    }

    /**
     * Delete product
     */
    public static deleteProducts(
        id: string,
    ): CancelablePromise<any> {
        return db.products.delete(id) as any;
    }

    /**
     * Export products
     */
    public static getProductsBulkExport(
        format?: 'csv' | 'xlsx',
    ): CancelablePromise<Blob> {
        return Promise.resolve(new Blob(['id,name,sku\n1,Product 1,SKU1'], { type: 'text/csv' })) as any;
    }
}
