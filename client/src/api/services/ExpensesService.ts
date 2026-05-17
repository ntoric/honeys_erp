import { db, generateId } from '@/lib/db';
import type { Expense } from '../models/Expense';
import type { PaginationMeta } from '../models/PaginationMeta';
import type { CancelablePromise } from '../core/CancelablePromise';

export class ExpensesService {
    private static getActiveSection(): 'retail' | 'wholesale' {
        if (typeof window === 'undefined') return 'retail';
        return (localStorage.getItem('pos_active_section') as any) || 'retail';
    }

    /**
     * List expenses
     */
    public static getExpenses(
        category?: string,
        fromDate?: string,
        toDate?: string,
        page: number = 1,
        perPage: number = 20,
    ): CancelablePromise<{
        data?: Array<Expense>;
        meta?: PaginationMeta;
    }> {
        return (async () => {
            const section = this.getActiveSection();
            let collection = db.expenses.where('section').equals(section);

            if (category) {
                collection = collection.filter(e => e.categoryName === category || e.categoryId === category);
            }

            if (fromDate) {
                collection = collection.filter(e => e.date >= fromDate);
            }

            if (toDate) {
                collection = collection.filter(e => e.date <= toDate);
            }

            const allItems = await collection.toArray();
            const total = allItems.length;
            const data = allItems.slice((page - 1) * perPage, page * perPage);

            return {
                data: data.map(e => ({
                    ...e,
                    expense_no: e.expenseNo,
                    category_id: e.categoryId,
                    category_name: e.categoryName,
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
     * Record expense
     */
    public static postExpenses(
        requestBody: Expense,
    ): CancelablePromise<Expense> {
        const item = {
            ...requestBody,
            id: requestBody.id || generateId(),
            expenseNo: (requestBody as any).expense_no || `EXP-${Date.now()}`,
            categoryId: (requestBody as any).category_id,
            categoryName: (requestBody as any).category_name,
            section: this.getActiveSection(),
        };
        return db.expenses.add(item as any).then(() => item) as any;
    }

    /**
     * Bulk action on expenses
     */
    public static postExpensesBulkAction(
        requestBody: {
            action: 'delete' | 'cancel' | 'export';
            ids: Array<string>;
        },
    ): CancelablePromise<{
        status?: string;
        message?: string;
    }> {
        const { action, ids } = requestBody;
        if (action === 'delete') {
            return db.expenses.bulkDelete(ids).then(() => ({ status: 'success', message: 'Expenses deleted' })) as any;
        } else if (action === 'cancel') {
            return db.expenses.where('id').anyOf(ids).modify({ status: 'Cancelled' }).then(() => ({ status: 'success', message: 'Expenses cancelled' })) as any;
        }
        return Promise.resolve({ status: 'success', message: 'Action executed' }) as any;
    }

    /**
     * Get expense
     */
    public static getExpenses1(
        id: string,
    ): CancelablePromise<Expense> {
        return db.expenses.get(id) as any;
    }

    /**
     * Update expense
     */
    public static putExpenses(
        id: string,
        requestBody: Expense,
    ): CancelablePromise<Expense> {
        return db.expenses.update(id, requestBody).then(() => requestBody) as any;
    }

    /**
     * Delete expense
     */
    public static deleteExpenses(
        id: string,
    ): CancelablePromise<void> {
        return db.expenses.delete(id) as any;
    }

    /**
     * List expense categories
     */
    public static getExpensesCategories(): CancelablePromise<Array<{
        id?: string;
        name?: string;
        is_active?: boolean;
    }>> {
        if (typeof window === 'undefined') {
            return Promise.resolve([
                { id: '1', name: 'Rent', is_active: true },
                { id: '2', name: 'Utilities', is_active: true },
                { id: '3', name: 'Salaries', is_active: true },
                { id: '4', name: 'Miscellaneous', is_active: true },
            ]) as any;
        }

        const stored = localStorage.getItem('pos_expense_categories');
        if (!stored) {
            const defaults = [
                { id: '1', name: 'Rent', is_active: true },
                { id: '2', name: 'Utilities', is_active: true },
                { id: '3', name: 'Salaries', is_active: true },
                { id: '4', name: 'Miscellaneous', is_active: true },
            ];
            localStorage.setItem('pos_expense_categories', JSON.stringify(defaults));
            return Promise.resolve(defaults) as any;
        }

        return Promise.resolve(JSON.parse(stored)) as any;
    }

    /**
     * Create expense category
     */
    public static postExpensesCategories(requestBody: {
        name: string;
    }): CancelablePromise<{
        id?: string;
        name?: string;
        is_active?: boolean;
    }> {
        const id = generateId();
        const newCat = { id, name: requestBody.name, is_active: true };

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('pos_expense_categories');
            const list = stored ? JSON.parse(stored) : [
                { id: '1', name: 'Rent', is_active: true },
                { id: '2', name: 'Utilities', is_active: true },
                { id: '3', name: 'Salaries', is_active: true },
                { id: '4', name: 'Miscellaneous', is_active: true },
            ];
            list.push(newCat);
            localStorage.setItem('pos_expense_categories', JSON.stringify(list));
        }

        return Promise.resolve(newCat) as any;
    }
}
