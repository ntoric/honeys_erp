import { db, generateId } from '@/lib/db';
import type { PaginationMeta } from '../models/PaginationMeta';
import type { PurchaseOrder } from '../models/PurchaseOrder';
import type { PurchaseReceipt } from '../models/PurchaseReceipt';
import type { CancelablePromise } from '../core/CancelablePromise';

export class PurchaseService {
    private static getActiveSection(): 'retail' | 'wholesale' {
        if (typeof window === 'undefined') return 'retail';
        return (localStorage.getItem('pos_active_section') as any) || 'retail';
    }

    /**
     * List purchase orders / invoices
     */
    public static getPurchaseOrders(
        vendorId?: string,
        status?: string,
        fromDate?: string,
        toDate?: string,
        page: number = 1,
        perPage: number = 20,
    ): CancelablePromise<{
        data?: Array<PurchaseOrder>;
        meta?: PaginationMeta;
    }> {
        return (async () => {
            const section = this.getActiveSection();
            let collection = db.purchaseInvoices.where('section').equals(section);

            if (status) {
                collection = collection.filter(i => i.status === status);
            }

            if (vendorId) {
                collection = collection.filter(i => i.partyId === vendorId);
            }

            if (fromDate) {
                collection = collection.filter(i => i.invoiceDate >= fromDate);
            }

            if (toDate) {
                collection = collection.filter(i => i.invoiceDate <= toDate);
            }

            const allItems = await collection.toArray();
            const total = allItems.length;
            const data = allItems.slice((page - 1) * perPage, page * perPage);

            return {
                data: data.map(i => ({
                    ...i,
                    vendor_name: i.partyName,
                    vendor_id: i.partyId,
                    purchase_date: i.invoiceDate,
                    total_amount: i.grandTotal,
                })) as any,
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
     * Create purchase order
     */
    public static postPurchaseOrders(
        requestBody: PurchaseOrder,
    ): CancelablePromise<PurchaseOrder> {
        const item = {
            ...requestBody,
            id: requestBody.id || generateId(),
            section: this.getActiveSection(),
            invoiceDate: (requestBody as any).purchase_date || new Date().toISOString(),
            status: requestBody.status || 'Received',
            partyId: (requestBody as any).vendor_id,
            partyName: (requestBody as any).vendor_name,
            grandTotal: (requestBody as any).total_amount || 0,
        };
        return db.purchaseInvoices.add(item as any).then(() => item) as any;
    }

    /**
     * Get purchase order
     */
    public static getPurchaseOrders1(
        id: string,
    ): CancelablePromise<PurchaseOrder> {
        return db.purchaseInvoices.get(id) as any;
    }

    /**
     * Update purchase order
     */
    public static putPurchaseOrders(
        id: string,
        requestBody: PurchaseOrder,
    ): CancelablePromise<PurchaseOrder> {
        return db.purchaseInvoices.update(id, requestBody).then(() => requestBody) as any;
    }

    /**
     * Cancel purchase order
     */
    public static deletePurchaseOrders(
        id: string,
    ): CancelablePromise<any> {
        return db.purchaseInvoices.update(id, { status: 'Cancelled' }) as any;
    }

    /**
     * Download PO as PDF
     */
    public static getPurchaseOrdersPdf(
        id: string,
    ): CancelablePromise<Blob> {
        return Promise.resolve(new Blob(['PDF content'], { type: 'application/pdf' })) as any;
    }

    /**
     * List goods receipts (GRNs)
     */
    public static getPurchaseReceipts(): CancelablePromise<any> {
        return Promise.resolve({ data: [], meta: { total: 0 } }) as any;
    }

    /**
     * List purchase bills (vendor invoices)
     */
    public static getPurchaseBills(
        vendorId?: string,
        status?: string,
        page?: number,
    ): CancelablePromise<Array<any>> {
        return (async () => {
            const section = this.getActiveSection();
            const items = await db.purchaseInvoices.where('section').equals(section).toArray();
            return items.map(i => ({
                id: i.id,
                bill_no: i.invoiceNo,
                vendor_id: i.partyId,
                bill_date: i.invoiceDate,
                grand_total: i.grandTotal,
                paid_amount: i.paidAmount,
                balance_due: i.balanceAmount,
                status: i.status
            }));
        })() as any;
    }

    /**
     * Create purchase bill (vendor invoice)
     */
    public static postPurchaseBills(
        requestBody: any,
    ): CancelablePromise<any> {
        const item = {
            id: requestBody.id || generateId(),
            invoiceNo: requestBody.invoice_no || `PUR-${Date.now()}`,
            partyId: requestBody.party_id,
            partyName: requestBody.party_name,
            invoiceDate: requestBody.invoice_date || new Date().toISOString(),
            status: requestBody.status || 'Received',
            grandTotal: requestBody.grand_total || 0,
            paidAmount: requestBody.paid_amount || 0,
            balanceAmount: requestBody.balance_amount || 0,
            section: this.getActiveSection(),
            items: requestBody.items || [],
        };
        return db.purchaseInvoices.add(item as any).then(() => item) as any;
    }
}
