import { db, generateId } from '@/lib/db';
import type { NotificationRequest } from '../models/NotificationRequest';
import type { PaginationMeta } from '../models/PaginationMeta';
import type { SalesInvoice } from '../models/SalesInvoice';
import type { SalesLineItem } from '../models/SalesLineItem';
import type { CancelablePromise } from '../core/CancelablePromise';

export class SalesService {
    private static getActiveSection(): 'retail' | 'wholesale' {
        if (typeof window === 'undefined') return 'retail';
        return (localStorage.getItem('pos_active_section') as any) || 'retail';
    }

    /**
     * List sales invoices
     */
    public static getSalesInvoices(
        invoiceType?: string,
        status?: string,
        customerId?: string,
        outletId?: string,
        fromDate?: string,
        toDate?: string,
        q?: string,
        page: number = 1,
        perPage: number = 20,
    ): CancelablePromise<{
        data?: Array<SalesInvoice>;
        meta?: PaginationMeta;
    }> {
        return (async () => {
            const section = this.getActiveSection();
            let collection = db.salesInvoices.where('section').equals(section);

            if (status) {
                collection = collection.filter(i => i.status === status);
            }

            if (customerId) {
                collection = collection.filter(i => i.partyId === customerId);
            }

            if (fromDate) {
                collection = collection.filter(i => i.invoiceDate >= fromDate);
            }

            if (toDate) {
                collection = collection.filter(i => i.invoiceDate <= toDate);
            }

            if (q) {
                const search = q.toLowerCase();
                collection = collection.filter(i => 
                    i.invoiceNo.toLowerCase().includes(search) || 
                    i.partyName.toLowerCase().includes(search)
                );
            }

            const allItems = await collection.toArray();
            const total = allItems.length;
            const data = allItems.slice((page - 1) * perPage, page * perPage);

            return {
                data: data as any,
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
     * Create sales invoice / POS bill
     */
    public static postSalesInvoices(
        requestBody: SalesInvoice,
    ): CancelablePromise<SalesInvoice> {
        const item = {
            ...requestBody,
            id: requestBody.id || generateId(),
            section: this.getActiveSection(),
            invoice_date: (requestBody as any).invoice_date || (requestBody as any).invoiceDate || new Date().toISOString(),
            status: requestBody.status || 'Paid',
        };
        return db.salesInvoices.add(item as any).then(() => item) as any;
    }

    /**
     * Get sales invoice
     */
    public static getSalesInvoices1(
        id: string,
    ): CancelablePromise<SalesInvoice> {
        return db.salesInvoices.get(id) as any;
    }

    /**
     * Update draft invoice
     */
    public static putSalesInvoices(
        id: string,
        requestBody: SalesInvoice,
    ): CancelablePromise<SalesInvoice> {
        return db.salesInvoices.update(id, requestBody).then(() => requestBody) as any;
    }

    /**
     * Cancel invoice
     */
    public static deleteSalesInvoices(
        id: string,
    ): CancelablePromise<any> {
        return db.salesInvoices.update(id, { status: 'Cancelled' }) as any;
    }

    /**
     * Download invoice as PDF
     */
    public static getSalesInvoicesPdf(
        id: string,
        template?: 'a4' | 'thermal_2inch' | 'thermal_3inch',
    ): CancelablePromise<Blob> {
        return Promise.resolve(new Blob(['PDF content'], { type: 'application/pdf' })) as any;
    }
}
