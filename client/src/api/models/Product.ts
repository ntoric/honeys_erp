/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductVariant } from './ProductVariant';
export type Product = {
    id?: string;
    sku?: string;
    name?: string;
    description?: string;
    product_type?: string;
    category_id?: string;
    sub_category_id?: string;
    brand?: string;
    unit?: string;
    item_code?: string;
    hsn_code?: string;
    measuring_unit?: string;
    stock_quantity?: number;
    enable_batching?: boolean;
    low_stock_warning?: boolean;
    low_stock_quantity?: number;
    sale_price?: number;
    wholesale_price?: number;
    sale_price_tax_inclusive?: boolean;
    purchase_price?: number;
    purchase_price_tax_inclusive?: boolean;
    gst_rate?: number;
    discount_on_sale?: number;
    cost_price?: number;
    mrp?: number;
    tax_category?: string;
    hsn_sac_code?: string;
    is_service?: boolean;
    track_inventory?: boolean;
    is_weighable?: boolean;
    barcode?: string;
    barcodes?: Array<string>;
    image_url?: string;
    expiry_date?: string;
    is_draft?: boolean;
    is_active?: boolean;
    variants?: Array<ProductVariant>;
    batch_tracking?: boolean;
    serial_tracking?: boolean;
    reorder_level?: number;
    reorder_qty?: number;
    created_at?: string;
    updated_at?: string;
};

