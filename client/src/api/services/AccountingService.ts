import { db, generateId } from '@/lib/db';
import type { Account } from '../models/Account';
import type { JournalEntry } from '../models/JournalEntry';
import type { LedgerEntry } from '../models/LedgerEntry';
import type { PaginationMeta } from '../models/PaginationMeta';
import type { CancelablePromise } from '../core/CancelablePromise';

export class AccountingService {
    private static getActiveSection(): 'retail' | 'wholesale' {
        if (typeof window === 'undefined') return 'retail';
        return (localStorage.getItem('pos_active_section') as any) || 'retail';
    }

    /**
     * List chart of accounts / Bank accounts
     */
    public static getAccountingAccounts(
        accountType?: string,
        isGroup?: boolean,
    ): CancelablePromise<Array<Account>> {
        return (async () => {
            const section = this.getActiveSection();
            const items = await db.bankAccounts.where('section').equals(section).toArray();
            return items.map(item => ({
                id: item.id,
                name: item.accountName,
                account_type: item.isCash ? 'Cash' : 'Bank',
                current_balance: item.balance,
                is_active: item.isActive,
            })) as any;
        })() as any;
    }

    /**
     * Create account
     */
    public static postAccountingAccounts(
        requestBody: Account,
    ): CancelablePromise<Account> {
        const item = {
            id: generateId(),
            accountName: requestBody.name || '',
            bankName: (requestBody as any).bank_name || '',
            accountNumber: (requestBody as any).account_number || '',
            section: this.getActiveSection(),
            opening_balance: requestBody.opening_balance || 0,
            current_balance: requestBody.current_balance || 0,
            isCash: (requestBody as any).account_type === 'Cash',
            isActive: true,
        };
        return db.bankAccounts.add(item as any).then(() => ({
            ...requestBody,
            id: item.id,
        })) as any;
    }

    /**
     * List journal entries
     */
    public static getAccountingJournalEntries(): CancelablePromise<{
        data?: Array<JournalEntry>;
        meta?: PaginationMeta;
    }> {
        return Promise.resolve({ data: [], meta: { total: 0 } }) as any;
    }

    /**
     * Get P&L statement
     */
    public static getAccountingProfitAndLoss(
        fromDate: string,
        toDate: string,
    ): CancelablePromise<any> {
        return (async () => {
            const section = this.getActiveSection();
            // Calculate real P&L from invoices and expenses
            const sales = await db.salesInvoices.where('section').equals(section).filter(i => i.invoiceDate >= fromDate && i.invoiceDate <= toDate).toArray();
            const expenses = await db.expenses.where('section').equals(section).filter(e => e.date >= fromDate && e.date <= toDate).toArray();
            
            const totalIncome = sales.reduce((sum, i) => sum + i.grandTotal, 0);
            const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

            return {
                total_income: totalIncome,
                total_expense: totalExpense,
                gross_profit: totalIncome - totalExpense,
                net_profit: totalIncome - totalExpense,
                sections: []
            };
        })() as any;
    }

    /**
     * Get balance sheet
     */
    public static getAccountingBalanceSheet(
        asOfDate: string,
    ): CancelablePromise<any> {
        return (async () => {
            const section = this.getActiveSection();
            const bankAccounts = await db.bankAccounts.where('section').equals(section).toArray();
            const totalAssets = bankAccounts.reduce((sum, a) => sum + a.balance, 0);

            return {
                total_assets: totalAssets,
                total_liabilities: 0,
                total_equity: totalAssets,
                sections: []
            };
        })() as any;
    }
}
