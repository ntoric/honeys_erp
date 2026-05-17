import { db } from '@/lib/db';
import type { Product } from '../models/Product';
import type { CancelablePromise } from '../core/CancelablePromise';

export class BarcodeService {
    private static getActiveSection(): 'retail' | 'wholesale' {
        if (typeof window === 'undefined') return 'retail';
        return (localStorage.getItem('pos_active_section') as any) || 'retail';
    }

    /**
     * Lookup product by barcode
     */
    public static getBarcodeLookup(
        code: string,
        outletId?: string,
    ): CancelablePromise<Product> {
        return (async () => {
            const section = this.getActiveSection();
            const product = await db.products
                .where('barcode').equals(code)
                .filter(p => p.section === section)
                .first();
            
            if (!product) {
                throw new Error('Barcode not found');
            }
            
            return {
                ...product,
                product_type: product.productType,
                category_id: product.categoryId,
                item_code: product.itemCode,
                stock_quantity: product.stockQuantity,
                sale_price: product.salePrice,
            } as any;
        })() as any;
    }

    /**
     * Generate barcode for product
     */
    public static postBarcodeGenerate(
        requestBody: {
            product_id: string;
            variant_id?: string;
            barcode_type?: 'ean13' | 'ean8' | 'code128' | 'qrcode';
            qty_labels?: number;
        },
    ): CancelablePromise<{
        barcode?: string;
        barcode_image_base64?: string;
        print_label_pdf_url?: string;
    }> {
        return Promise.resolve({ barcode: '1234567890' }) as any;
    }
}
