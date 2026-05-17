import { db, generateId } from '@/lib/db';
import type { PaginationMeta } from '../models/PaginationMeta';
import type { PaymentEntry } from '../models/PaymentEntry';
import type { CancelablePromise } from '../core/CancelablePromise';

export class PaymentsService {
    private static getActiveSection(): 'retail' | 'wholesale' {
        if (typeof window === 'undefined') return 'retail';
        return (localStorage.getItem('pos_active_section') as any) || 'retail';
    }

    /**
     * List payment entries
     */
    public static getPayments(
        paymentType?: 'receive' | 'pay',
        party_type?: string,
        partyId?: string,
        fromDate?: string,
        toDate?: string,
        page: number = 1,
        perPage: number = 20,
    ): CancelablePromise<{
        data?: Array<PaymentEntry>;
        meta?: PaginationMeta;
    }> {
        return (async () => {
            const section = this.getActiveSection();
            let collection = db.payments.where('section').equals(section);

            if (paymentType) {
                collection = collection.filter(p => p.paymentType === paymentType);
            }

            if (partyId) {
                collection = collection.filter(p => p.partyId === partyId);
            }

            if (fromDate) {
                collection = collection.filter(p => p.paymentDate >= fromDate);
            }

            if (toDate) {
                collection = collection.filter(p => p.paymentDate <= toDate);
            }

            const allItems = await collection.toArray();
            const total = allItems.length;
            const data = allItems.slice((page - 1) * perPage, page * perPage);

            return {
                data: data.map(p => ({
                    ...p,
                    payment_type: p.paymentType,
                    party_id: p.partyId,
                    party_name: p.partyName,
                    payment_date: p.paymentDate,
                    payment_mode: p.paymentMode,
                    payment_no: p.paymentNo,
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
     * Create payment entry
     */
    public static postPayments(
        requestBody: PaymentEntry,
    ): CancelablePromise<PaymentEntry> {
        const item = {
            ...requestBody,
            id: requestBody.id || generateId(),
            section: this.getActiveSection(),
            paymentDate: (requestBody as any).payment_date || new Date().toISOString(),
            paymentType: (requestBody as any).payment_type || 'receive',
            partyId: (requestBody as any).party_id,
            partyName: (requestBody as any).party_name,
            paymentNo: (requestBody as any).payment_no || `PAY-${Date.now()}`,
            paymentMode: (requestBody as any).payment_mode || 'Cash',
            status: (requestBody as any).status || 'Success',
        };
        return db.payments.add(item as any).then(() => item) as any;
    }

    /**
     * Get payment entry
     */
    public static getPayments1(
        id: string,
    ): CancelablePromise<PaymentEntry> {
        return db.payments.get(id) as any;
    }

    /**
     * Cancel payment
     */
    public static deletePayments(
        id: string,
    ): CancelablePromise<any> {
        return db.payments.update(id, { status: 'Cancelled' }) as any;
    }

    /**
     * Get outstanding invoices (receivables / payables)
     */
    public static getPaymentsOutstanding(
        party_type: 'customer' | 'vendor',
        partyId?: string,
        overdueOnly?: boolean,
    ): CancelablePromise<Array<any>> {
        return (async () => {
            const section = this.getActiveSection();
            if (party_type === 'customer') {
                const invoices = await db.salesInvoices
                    .where('section').equals(section)
                    .filter(i => i.balanceAmount > 0 && (!partyId || i.partyId === partyId))
                    .toArray();
                return invoices.map(i => ({
                    invoice_id: i.id,
                    invoice_no: i.invoiceNo,
                    invoice_date: i.invoiceDate,
                    grand_total: i.grandTotal,
                    paid_amount: i.paidAmount,
                    balance_due: i.balanceAmount,
                }));
            } else {
                const invoices = await db.purchaseInvoices
                    .where('section').equals(section)
                    .filter(i => i.balanceAmount > 0 && (!partyId || i.partyId === partyId))
                    .toArray();
                return invoices.map(i => ({
                    invoice_id: i.id,
                    invoice_no: i.invoiceNo,
                    invoice_date: i.invoiceDate,
                    grand_total: i.grandTotal,
                    paid_amount: i.paidAmount,
                    balance_due: i.balanceAmount,
                }));
            }
        })() as any;
    }
}
