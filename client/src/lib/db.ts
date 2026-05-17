import Dexie, { type Table } from 'dexie';

export interface Store {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  roleId: string;
  storeId?: string; // Optional: superadmin might not have a fixed storeId, or can access all
  password?: string;
  tempPassword?: string;
  tempPasswordExpiry?: string;
  mustChangePassword?: boolean;
  isActive: boolean;
  lastLogin?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Category {
  id: string;
  storeId?: string;
  name: string;
  sku: string;
  section: 'retail' | 'wholesale';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  storeId?: string;
  sku: string;
  name: string;
  description?: string;
  productType?: string;
  categoryId: string;
  section: 'retail' | 'wholesale';
  itemCode?: string;
  barcode?: string;
  stockQuantity?: number;
  lowStockWarning?: boolean;
  lowStockQuantity?: number;
  salePrice?: number;
  wholesalePrice?: number;
  purchasePrice?: number;
  isActive?: boolean;
  isDraft?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Party {
  id: string;
  storeId?: string;
  name: string;
  category?: string;
  party_type: 'customer' | 'vendor';
  section: 'retail' | 'wholesale';
  mobile: string;
  email: string;
  gstin?: string;
  address?: string;
  balance: number;
  isActive: boolean;
}

export interface SalesInvoice {
  id: string;
  storeId?: string;
  invoiceNo: string;
  partyId: string;
  partyName: string;
  partyGstin?: string;
  section: 'retail' | 'wholesale';
  partyMobile?: string;
  partyEmail?: string;
  partyAddress?: string;
  invoiceDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  taxBreakdown?: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  discountAmount: number;
  additionalCharges: { label: string; amount: number }[];
  grandTotal: number;
  paidAmount: number;
  receivedAmount?: number;
  changeAmount?: number;
  paymentMethod?: string;
  balanceAmount: number;
  items: any[];
  createdAt?: string;
}

export interface SuspendedSale {
  id: string;
  storeId?: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  section: 'retail' | 'wholesale';
  items: any[];
  additionalCharges: { label: string; amount: number }[];
  discountAmount: number;
  createdAt: string;
}

export interface Settings {
  id: string;
  storeId?: string; // Global or store-specific
  key: string;
  value: any;
}

export interface PurchaseInvoice {
  id: string;
  storeId?: string;
  invoiceNo: string;
  partyId: string;
  partyName: string;
  section: 'retail' | 'wholesale';
  invoiceDate: string;
  status: string;
  taxAmount?: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  items: any[];
  createdAt?: string;
}

export interface Payment {
  id: string;
  storeId?: string;
  paymentNo: string;
  paymentType: 'receive' | 'pay';
  section: 'retail' | 'wholesale';
  partyId: string;
  partyName: string;
  paymentDate: string;
  amount: number;
  paymentMode: string;
  status: string;
}

export interface BankAccount {
  id: string;
  storeId?: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  section: 'retail' | 'wholesale';
  balance: number;
  isCash: boolean;
  isActive: boolean;
}

export interface Expense {
  id: string;
  storeId?: string;
  expenseNo: string;
  date: string;
  categoryId: string;
  categoryName: string;
  section: 'retail' | 'wholesale';
  amount: number;
  paymentMode: string;
  status: string;
}

export interface Staff {
  id: string;
  storeId?: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  salary: number;
  joining_date?: string;
  isActive: boolean;
}

export interface Attendance {
  id: string;
  storeId?: string;
  staffId: string;
  date: string;
  status: string;
}

export interface AuditLog {
  id: string;
  storeId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  user: string;
  ip?: string;
}

export class MarioDB extends Dexie {
  stores!: Table<Store>;
  users!: Table<User>;
  roles!: Table<Role>;
  categories!: Table<Category>;
  products!: Table<Product>;
  parties!: Table<Party>;
  salesInvoices!: Table<SalesInvoice>;
  purchaseInvoices!: Table<PurchaseInvoice>;
  payments!: Table<Payment>;
  bankAccounts!: Table<BankAccount>;
  expenses!: Table<Expense>;
  staff!: Table<Staff>;
  attendance!: Table<Attendance>;
  suspendedSales!: Table<SuspendedSale>;
  settings!: Table<Settings>;
  auditLogs!: Table<AuditLog>;

  constructor() {
    super('MarioDB');
    console.log('[MarioDB] Initializing version 10');
    this.version(10).stores({
      stores: 'id, name, isActive',
      users: 'id, email, username, storeId',
      roles: 'id, name',
      categories: 'id, name, sku, section, storeId',
      products: 'id, sku, name, categoryId, itemCode, barcode, section, storeId',
      parties: 'id, name, mobile, party_type, section, storeId',
      salesInvoices: 'id, invoiceNo, partyId, status, section, storeId',
      purchaseInvoices: 'id, invoiceNo, partyId, status, section, storeId',
      payments: 'id, paymentNo, partyId, paymentType, section, storeId',
      bankAccounts: 'id, accountName, section, storeId',
      expenses: 'id, expenseNo, categoryId, section, storeId',
      staff: 'id, phone, storeId',
      attendance: 'id, staffId, date, storeId',
      suspendedSales: 'id, customerMobile, section, storeId',
      settings: 'id, key, storeId',
      auditLogs: 'id, action, entityType, entityId, timestamp, ip, storeId',
    }).upgrade(async (tx) => {
      // 1. Seed Default Store
      const defaultStoreId = 'store-default';
      const defaultStore = {
        id: defaultStoreId,
        name: 'Default Store',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await tx.table('stores').put(defaultStore);

      // 2. Assign existing records to the default store
      const tablesWithStoreId = [
        'users', 'categories', 'products', 'parties', 'salesInvoices',
        'purchaseInvoices', 'payments', 'bankAccounts', 'expenses',
        'staff', 'attendance', 'suspendedSales', 'settings'
      ];

      for (const tableName of tablesWithStoreId) {
        const table = tx.table(tableName);
        const records = await table.toArray();
        for (const record of records) {
          if (!record.storeId) {
            await table.update(record.id, { storeId: defaultStoreId });
          }
        }
      }

      // 3. Seed default roles and admin user if they don't exist
      const systemAdminRole = {
        id: 'role-system-admin',
        name: 'System Administrator',
        permissions: ['all']
      };
      const storeAdminRole = {
        id: 'role-store-admin',
        name: 'Store Administrator',
        permissions: ['pos_billing', 'view_reports', 'manage_inventory', 'view_sales', 'view_staff', 'view_accounting']
      };
      const staffRole = {
        id: 'role-staff',
        name: 'Staff',
        permissions: ['pos_billing', 'view_reports']
      };
      
      await tx.table('roles').bulkPut([systemAdminRole, storeAdminRole, staffRole]);
      
      await tx.table('users').put({
        id: 'user-admin',
        name: 'Administrator',
        username: 'ntoric',
        email: 'admin@hexonics.com',
        phone: '9876543210',
        roleId: 'role-system-admin',
        storeId: defaultStoreId,
        password: '0f9855845d129111a00fcc926f624bcd15aacd8957e6b4c77dfe7dd27b03f88d', // ntoric@2026
        isActive: true,
      });
    });

    // Setup Hooks for Auditing
    const tablesToAudit = [
      'users', 'roles', 'categories', 'products', 'parties', 'salesInvoices',
      'purchaseInvoices', 'payments', 'bankAccounts', 'expenses',
      'staff', 'attendance', 'suspendedSales', 'settings', 'stores'
    ];

    tablesToAudit.forEach(tableName => {
      const table = this.table(tableName);

      table.hook('creating', (primKey, obj) => {
        console.log(`[Audit] Creating ${tableName}`, obj);
        Dexie.ignoreTransaction(() => {
          this.auditLogs.add({
            id: generateId(),
            action: 'CREATE',
            entityType: tableName,
            entityId: (primKey || (obj as any).id)?.toString() || 'unknown',
            storeId: (obj as any).storeId || localStorage.getItem('pos_active_store_id') || undefined,
            newValue: obj,
            timestamp: new Date().toISOString(),
            user: localStorage.getItem('pos_user_name') || 'System',
            ip: userIp
          }).catch(err => console.error(`[Audit] Error creating log for ${tableName}:`, err));
        });
      });

      table.hook('updating', (modifications, primKey, obj) => {
        console.log(`[Audit] Updating ${tableName}`, modifications);
        Dexie.ignoreTransaction(() => {
          this.auditLogs.add({
            id: generateId(),
            action: 'UPDATE',
            entityType: tableName,
            entityId: primKey.toString(),
            storeId: (obj as any).storeId || (modifications as any).storeId || localStorage.getItem('pos_active_store_id') || undefined,
            oldValue: obj,
            newValue: { ...obj, ...modifications },
            timestamp: new Date().toISOString(),
            user: localStorage.getItem('pos_user_name') || 'System',
            ip: userIp
          }).catch(err => console.error(`[Audit] Error updating log for ${tableName}:`, err));
        });
      });

      table.hook('deleting', (primKey, obj) => {
        console.log(`[Audit] Deleting ${tableName}`, primKey);
        Dexie.ignoreTransaction(() => {
          this.auditLogs.add({
            id: generateId(),
            action: 'DELETE',
            entityType: tableName,
            entityId: primKey.toString(),
            storeId: (obj as any).storeId || localStorage.getItem('pos_active_store_id') || undefined,
            oldValue: obj,
            timestamp: new Date().toISOString(),
            user: localStorage.getItem('pos_user_name') || 'System',
            ip: userIp
          }).catch(err => console.error(`[Audit] Error deleting log for ${tableName}:`, err));
        });
      });
    });

    // Handle version changes to allow upgrades in multi-tab scenarios
    this.on('versionchange', (event) => {
      this.close();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });
  }
}

export const db = new MarioDB();

export const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`;
};

let userIp = '127.0.0.1';
if (typeof window !== 'undefined') {
  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => { userIp = data.ip; })
    .catch(() => { /* stay with default */ });
}
