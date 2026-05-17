'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService } from '@/api/services/AuthService';
import { OpenAPI } from '@/api/core/OpenAPI';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  roleId: string;
  storeId?: string;
  role?: {
    id: string;
    name: string;
    permissions: string[];
  };
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapUserRole = (userData: any): User | null => {
  if (!userData) return null;
  
  // If role is already an object with permissions, return it directly
  if (userData.role && typeof userData.role === 'object' && Array.isArray(userData.role.permissions)) {
    return {
      ...userData,
      roleId: userData.roleId || userData.role.id
    };
  }

  // If role is a string or does not have permissions array, map it to the object format required by the UI
  const roleStr = String(userData.role || '').toLowerCase();
  let mappedRole = {
    id: 'role-staff',
    name: 'Staff',
    permissions: ['pos_billing', 'view_reports']
  };
  
  if (roleStr === 'admin' || roleStr === 'role-system-admin') {
    mappedRole = {
      id: 'role-system-admin',
      name: 'System Administrator',
      permissions: ['all']
    };
  } else if (roleStr === 'manager' || roleStr === 'role-store-admin') {
    mappedRole = {
      id: 'role-store-admin',
      name: 'Store Administrator',
      permissions: ['pos_billing', 'view_reports', 'manage_inventory', 'view_sales', 'view_staff', 'view_accounting']
    };
  } else if (roleStr === 'cashier' || roleStr === 'role-staff') {
    mappedRole = {
      id: 'role-staff',
      name: 'Staff',
      permissions: ['pos_billing', 'view_reports']
    };
  } else if (roleStr === 'accountant') {
    mappedRole = {
      id: 'role-staff',
      name: 'Staff',
      permissions: ['view_reports', 'view_accounting']
    };
  } else if (roleStr === 'viewer') {
    mappedRole = {
      id: 'role-staff',
      name: 'Staff',
      permissions: ['view_reports']
    };
  }
  
  return {
    ...userData,
    roleId: mappedRole.id,
    role: mappedRole
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pos_token');
      const storedUser = localStorage.getItem('pos_user');
      
      if (token && storedUser) {
        OpenAPI.TOKEN = token;
        try {
          // Pre-populate with stored user mapped
          const parsed = JSON.parse(storedUser);
          setUser(mapUserRole(parsed));
          
          const userData = await AuthService.getAuthMe();
          if (userData) {
            const mapped = mapUserRole(userData);
            setUser(mapped);
            localStorage.setItem('pos_user', JSON.stringify(mapped));
            localStorage.setItem('pos_user_name', mapped?.name || '');
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await AuthService.postAuthLogin({ username, password });
      const { access_token, user: userData } = response;
      const token = access_token;
      
      if (!token || !userData) {
        throw new Error('Invalid login response from server');
      }
      
      const mappedUser = mapUserRole(userData);
      
      localStorage.setItem('pos_token', token);
      localStorage.setItem('pos_user', JSON.stringify(mappedUser));
      localStorage.setItem('pos_user_name', mappedUser?.name || '');
      
      OpenAPI.TOKEN = token;
      setUser(mappedUser);
      
      toast.success('Login successful');
      
      if ((userData as any).mustChangePassword) {
        router.push('/login?changePassword=true');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_user_name');
    OpenAPI.TOKEN = undefined;
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const userData = await AuthService.getAuthMe();
      const mappedUser = mapUserRole(userData);
      setUser(mappedUser);
      localStorage.setItem('pos_user', JSON.stringify(mappedUser));
      localStorage.setItem('pos_user_name', mappedUser?.name || '');
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  };

  const hasPermission = (permission: string) => {
    if (!user || !user.role) return false;
    if (user.role.permissions.includes('all')) return true;
    return user.role.permissions.includes(permission);
  };

  // Redirect to login if not authenticated (except for /login page)
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasPermission, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
