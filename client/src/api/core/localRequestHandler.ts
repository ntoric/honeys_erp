import { db, generateId } from '../../lib/db';
import { hashPassword } from '../../lib/hash';
import type { ApiRequestOptions } from './ApiRequestOptions';

const getActiveStoreId = () => {
  if (typeof window === 'undefined') return 'store-default';
  return localStorage.getItem('pos_active_store_id') || 'store-default';
};

/**
 * Ensures that the basic system data (roles, default store, and admin user) exists.
 * This acts as a self-healing mechanism for fresh installs or cleared databases.
 */
async function ensureSystemData() {
  const defaultStoreId = 'store-default';
  
  // 1. Ensure Default Store
  const store = await db.stores.get(defaultStoreId);
  if (!store) {
    await db.stores.put({
      id: defaultStoreId,
      name: 'Default Store',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 2. Ensure Default Roles
  const systemAdminRole = { id: 'role-system-admin', name: 'System Administrator', permissions: ['all'] };
  const storeAdminRole = { 
    id: 'role-store-admin', 
    name: 'Store Administrator', 
    permissions: ['pos_billing', 'view_reports', 'manage_inventory', 'view_sales', 'view_staff', 'view_accounting'] 
  };
  const staffRole = { id: 'role-staff', name: 'Staff', permissions: ['pos_billing', 'view_reports'] };
  
  await db.roles.bulkPut([systemAdminRole, storeAdminRole, staffRole]);

  // 3. Ensure Admin User
  const adminUser = await db.users.get('user-admin');
  if (!adminUser) {
    await db.users.put({
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
  }
}

/**
 * Maps API requests to local Dexie operations.
 */
export async function handleLocalRequest(options: ApiRequestOptions): Promise<any> {
  const { method, url, body, query, path } = options;
  const activeStoreId = getActiveStoreId();

  // Normalize URL
  const endpoint = url.split('?')[0];

  // Self-heal on every major request to ensure system is initialized
  await ensureSystemData();

  console.log(`[LocalDB] ${method} ${endpoint} (Store: ${activeStoreId})`, { query, path, body });

  try {
    // STORES
    if (endpoint === '/stores') {
      if (method === 'GET') return await db.stores.toArray();
      if (method === 'POST') {
        const id = generateId();
        const newStore = { 
          ...body, 
          id, 
          isActive: true, 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        };
        await db.stores.add(newStore);
        return newStore;
      }
    }

    if (endpoint === '/stores/{id}') {
      const id = path?.id;
      if (method === 'GET') return await db.stores.get(id);
      if (method === 'PUT') {
        await db.stores.update(id, { ...body, updatedAt: new Date().toISOString() });
        return await db.stores.get(id);
      }
      if (method === 'DELETE') {
        // Prevent deleting default store or last store?
        await db.stores.delete(id);
        return { success: true };
      }
    }

    // AUTH
    if (endpoint === '/auth/login') {
      const { username, password } = body;
      if (!username) throw new Error('Username is required');
      
      const trimmedUsername = username.trim();
      const user = await db.users
        .filter(u => (u.username || '').toLowerCase() === trimmedUsername.toLowerCase())
        .first();
      
      if (!user) throw new Error('Invalid credentials');
      
      const hashedPassword = await hashPassword(password);
      
      // Check password (hashed comparison)
      if (user.password !== hashedPassword && user.tempPassword !== hashedPassword) {
        throw new Error('Invalid credentials');
      }

      // Check temp password expiry
      if (user.tempPassword === hashedPassword && user.tempPasswordExpiry) {
        if (new Date() > new Date(user.tempPasswordExpiry)) {
          throw new Error('Temporary password expired');
        }
      }

      const token = 'mock-token-' + user.id;
      
      // Self-healing: ensure roles exist
      let role = await db.roles.get(user.roleId);
      if (!role && user.id === 'user-admin') {
        const systemAdminRole = { id: 'role-system-admin', name: 'System Administrator', permissions: ['all'] };
        await db.roles.put(systemAdminRole);
        if (user.roleId !== 'role-system-admin') {
          await db.users.update('user-admin', { roleId: 'role-system-admin' });
        }
        role = systemAdminRole;
      }
      
      return { 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          username: user.username,
          email: user.email, 
          roleId: user.roleId, 
          storeId: user.storeId,
          role,
          mustChangePassword: !!user.tempPassword || user.mustChangePassword 
        } 
      };
    }

    if (endpoint === '/auth/me') {
      const userId = options.headers?.['Authorization']?.replace('Bearer ', '')?.replace('mock-token-', '');
      if (!userId) return null;
      const user = await db.users.get(userId);
      if (!user) return null;
      
      let role = await db.roles.get(user.roleId);
      if (!role && user.id === 'user-admin') {
        role = { id: 'role-system-admin', name: 'System Administrator', permissions: ['all'] };
        await db.roles.put(role);
        if (user.roleId !== 'role-system-admin') {
          await db.users.update('user-admin', { roleId: 'role-system-admin' });
        }
      }
      
      return { ...user, role };
    }

    if (endpoint === '/auth/change-password') {
      const { old_password, new_password } = body;
      const userId = options.headers?.['Authorization']?.replace('Bearer ', '')?.replace('mock-token-', '');
      if (!userId) throw new Error('Unauthorized');
      const user = await db.users.get(userId);
      const hashedOldPassword = await hashPassword(old_password);
      if (!user || (user.password !== hashedOldPassword && user.tempPassword !== hashedOldPassword)) {
        throw new Error('Invalid old password');
      }
      const hashedNewPassword = await hashPassword(new_password);
      await db.users.update(userId, { 
        password: hashedNewPassword, 
        tempPassword: undefined, 
        tempPasswordExpiry: undefined, 
        mustChangePassword: false 
      });
      return { success: true };
    }

    // USERS
    if (endpoint === '/users') {
      if (method === 'GET') {
        // Only superadmins can see all users across all stores? 
        const userId = options.headers?.['Authorization']?.replace('Bearer ', '')?.replace('mock-token-', '');
        const requester = userId ? await db.users.get(userId) : null;
        const isSystemAdmin = requester?.roleId === 'role-system-admin';

        let users;
        if (isSystemAdmin) {
          users = await db.users.toArray();
        } else {
          users = await db.users.where('storeId').equals(activeStoreId).toArray();
        }

        const usersWithRoles = await Promise.all(users.map(async u => {
          const role = await db.roles.get(u.roleId);
          const store = u.storeId ? await db.stores.get(u.storeId) : null;
          return { ...u, roleName: role?.name, storeName: store?.name };
        }));
        return usersWithRoles;
      }
      if (method === 'POST') {
        const id = body.id || generateId();
        const tempPassword = Math.random().toString(36).substring(2, 10);
        const hashedTempPassword = await hashPassword(tempPassword);
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        
        const newUser = { 
          ...body, 
          id, 
          storeId: body.storeId || activeStoreId,
          username: body.username || body.email?.split('@')[0] || `user_${generateId().substring(0, 5)}`,
          tempPassword: hashedTempPassword, 
          tempPasswordExpiry: expiry.toISOString(),
          mustChangePassword: true,
          isActive: true,
          createdAt: new Date().toISOString() 
        };
        await db.users.add(newUser);
        return { ...newUser, displayTempPassword: tempPassword };
      }
    }

    if (endpoint === '/users/{id}') {
      const id = path?.id;
      if (method === 'GET') return await db.users.get(id);
      if (method === 'PUT') {
        await db.users.update(id, body);
        return await db.users.get(id);
      }
      if (method === 'DELETE') {
        await db.users.delete(id);
        return { success: true };
      }
    }

    // ROLES
    if (endpoint === '/roles') {
      if (method === 'GET') return await db.roles.toArray();
      if (method === 'POST') {
        const id = generateId();
        const newRole = { ...body, id };
        await db.roles.add(newRole);
        return newRole;
      }
    }

    // PRODUCTS
    if (endpoint === '/products') {
      if (method === 'GET') {
        let collection = db.products.where('storeId').equals(activeStoreId);
        if (query?.q) {
          const q = query.q.toLowerCase();
          collection = collection.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.sku.toLowerCase().includes(q) || 
            !!p.barcode?.toLowerCase().includes(q)
          );
        }
        if (query?.category_id) {
          collection = collection.filter(p => p.categoryId === query.category_id);
        }
        const data = await collection.toArray();
        return { data, meta: { total: data.length, page: 1, per_page: 50 } };
      }
      if (method === 'POST') {
        const id = body.id || generateId();
        const newProduct = { ...body, id, storeId: activeStoreId, createdAt: new Date().toISOString() };
        await db.products.add(newProduct);
        return newProduct;
      }
    }

    // CATEGORIES
    if (endpoint === '/categories') {
      if (method === 'GET') return await db.categories.where('storeId').equals(activeStoreId).toArray();
      if (method === 'POST') {
        const id = generateId();
        const newCat = { ...body, id, storeId: activeStoreId };
        await db.categories.add(newCat);
        return newCat;
      }
    }

    // PARTIES
    if (endpoint === '/parties') {
      if (method === 'GET') {
        const { party_type, search, category } = options.query || {};
        let data = await db.parties.where('storeId').equals(activeStoreId).toArray();

        if (party_type) {
          data = data.filter((p: any) => p.party_type === party_type);
        }
        if (search) {
          const q = search.toLowerCase();
          data = data.filter((p: any) => 
            p.name.toLowerCase().includes(q) || 
            (p.mobile || '').includes(q)
          );
        }
        if (category && category !== 'All') {
          data = data.filter((p: any) => p.category === category);
        }

        const stats = {
          total_parties: data.length,
          to_collect: data.filter((p: any) => p.party_type === 'customer').reduce((sum, p) => sum + (p.balance || 0), 0),
          to_pay: data.filter((p: any) => p.party_type === 'vendor').reduce((sum, p) => sum + (p.balance || 0), 0)
        };

        return { data, stats };
      }
      if (method === 'POST') {
        const id = generateId();
        const newParty = { 
          ...body, 
          id, 
          storeId: activeStoreId,
          party_type: body.party_type || 'customer',
          is_active: body.is_active ?? true,
          is_blocked: body.is_blocked ?? false,
          balance: body.balance ?? 0,
          created_at: new Date().toISOString()
        };
        await db.parties.add(newParty);
        return newParty;
      }
    }

    // AUDIT LOGS
    if (endpoint === '/audit' || endpoint === '/audit-logs') {
      if (method === 'GET') {
        const logs = await db.auditLogs.where('storeId').equals(activeStoreId).toArray();
        return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      }
    }

    // SALES INVOICES
    if (endpoint === '/sales/invoices') {
      if (method === 'GET') {
        let data = await db.salesInvoices.where('storeId').equals(activeStoreId).toArray();
        const { status, query, q, from_date, fromDate, to_date, toDate } = options.query || {};
        const searchTerm = (query || q || '').toLowerCase();
        const start = from_date || fromDate;
        const end = to_date || toDate;

        if (status) {
          data = data.filter((inv: any) => (inv.status || '').toLowerCase() === status.toLowerCase());
        }
        if (searchTerm) {
          data = data.filter((inv: any) => 
            (inv.invoice_no || inv.invoiceNo || '').toLowerCase().includes(searchTerm) ||
            (inv.party_name || inv.partyName || '').toLowerCase().includes(searchTerm)
          );
        }
        if (start) {
          data = data.filter((inv: any) => (inv.invoice_date || inv.invoiceDate) >= start);
        }
        if (end) {
          data = data.filter((inv: any) => (inv.invoice_date || inv.invoiceDate) <= end);
        }

        return { data, meta: { total: data.length } };
      }
      if (method === 'POST') {
        const id = body.id || generateId();
        const invoiceNo = body.invoiceNo || `INV-${Date.now()}`;
        const newInvoice = { ...body, id, storeId: activeStoreId, invoiceNo, createdAt: new Date().toISOString() };
        await db.salesInvoices.add(newInvoice);
        return newInvoice;
      }
    }

    // PURCHASE BILLS
    if (endpoint === '/purchase/bills') {
      if (method === 'GET') {
        let data = await db.purchaseInvoices.where('storeId').equals(activeStoreId).toArray();
        const { status, query, q, from_date, fromDate, to_date, toDate } = options.query || {};
        const searchTerm = (query || q || '').toLowerCase();
        const start = from_date || fromDate;
        const end = to_date || toDate;

        if (status) {
          data = data.filter((inv: any) => (inv.status || '').toLowerCase() === status.toLowerCase());
        }
        if (searchTerm) {
          data = data.filter((inv: any) => 
            (inv.invoice_no || inv.invoiceNo || inv.bill_no || inv.billNo || '').toLowerCase().includes(searchTerm) ||
            (inv.party_name || inv.partyName || '').toLowerCase().includes(searchTerm)
          );
        }
        if (start) {
          data = data.filter((inv: any) => (inv.invoice_date || inv.invoiceDate || inv.bill_date || inv.billDate) >= start);
        }
        if (end) {
          data = data.filter((inv: any) => (inv.invoice_date || inv.invoiceDate || inv.bill_date || inv.billDate) <= end);
        }

        return { data, meta: { total: data.length } };
      }
      if (method === 'POST') {
        const id = body.id || generateId();
        const invoiceNo = body.invoiceNo || `PUR-${Date.now()}`;
        const newInvoice = { ...body, id, storeId: activeStoreId, invoiceNo, createdAt: new Date().toISOString() };
        await db.purchaseInvoices.add(newInvoice);
        return newInvoice;
      }
    }

    // EXPENSES
    if (endpoint === '/expenses') {
      if (method === 'GET') {
        let data = await db.expenses.where('storeId').equals(activeStoreId).toArray();
        const { category, from_date, to_date } = options.query || {};

        if (category && category !== 'All') {
          data = data.filter((exp: any) => exp.category_name === category || exp.categoryName === category);
        }
        if (from_date) {
          data = data.filter((exp: any) => (exp.date || exp.expenseDate) >= from_date);
        }
        if (to_date) {
          data = data.filter((exp: any) => (exp.date || exp.expenseDate) <= to_date);
        }

        return { data, meta: { total: data.length } };
      }
      if (method === 'POST') {
        const id = generateId();
        const newExpense = { ...body, id, storeId: activeStoreId };
        await db.expenses.add(newExpense);
        return newExpense;
      }
    }

    // STAFF
    if (endpoint === '/staff') {
      if (method === 'GET') return await db.staff.where('storeId').equals(activeStoreId).toArray();
      if (method === 'POST') {
        const id = generateId();
        const newStaff = { ...body, id, storeId: activeStoreId };
        await db.staff.add(newStaff);
        
        // Automatically create a user account for staff
        const tempPassword = Math.random().toString(36).substring(2, 10);
        const hashedTempPassword = await hashPassword(tempPassword);
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        
        await db.users.add({
          id: generateId(),
          storeId: activeStoreId,
          name: newStaff.name,
          username: newStaff.name.toLowerCase().replace(/ /g, '.'),
          email: newStaff.email || `${newStaff.name.toLowerCase().replace(/ /g, '.')}@hexonics.com`,
          phone: newStaff.phone,
          roleId: 'role-staff', // Default staff role
          tempPassword: hashedTempPassword,
          tempPasswordExpiry: expiry.toISOString(),
          mustChangePassword: true,
          isActive: true
        });
        
        return { ...newStaff, tempPassword }; // Return temp password to UI
      }
    }

    // ATTENDANCE
    if (endpoint === '/attendance') {
      if (method === 'GET') {
        let collection = db.attendance.where('storeId').equals(activeStoreId);
        if (query?.staff_id) collection = collection.filter(a => a.staffId === query.staff_id);
        if (query?.date) collection = collection.filter(a => a.date === query.date);
        return await collection.toArray();
      }
      if (method === 'POST') {
        const id = generateId();
        const newAttendance = { ...body, id, storeId: activeStoreId };
        await db.attendance.add(newAttendance);
        return newAttendance;
      }
    }

    // BANK ACCOUNTS
    if (endpoint === '/accounts') {
      if (method === 'GET') return await db.bankAccounts.where('storeId').equals(activeStoreId).toArray();
      if (method === 'POST') {
        const id = generateId();
        const newAccount = { ...body, id, storeId: activeStoreId };
        await db.bankAccounts.add(newAccount);
        return newAccount;
      }
    }

    // Default: return empty or throw error if not implemented
    console.warn(`[LocalDB] Endpoint not implemented: ${method} ${endpoint}`);
    if (method === 'GET') return [];
    return { message: 'Success (Mocked)' };

  } catch (error) {
    console.error(`[LocalDB] Error handling ${method} ${endpoint}:`, error);
    throw error;
  }
}
