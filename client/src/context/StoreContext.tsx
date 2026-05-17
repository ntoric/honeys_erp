'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db, Store } from '@/lib/db';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  isLoading: boolean;
  switchStore: (storeId: string) => Promise<void>;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const loadStores = useCallback(async () => {
    try {
      const allStores = await db.stores.toArray();
      setStores(allStores);
      return allStores;
    } catch (error) {
      console.error('Failed to load stores', error);
      return [];
    }
  }, []);

  const initStore = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCurrentStore(null);
      setIsLoading(false);
      return;
    }

    const allStores = await loadStores();
    
    // Determine which store to use
    let activeStoreId = localStorage.getItem('pos_active_store_id');
    
    // If user has a fixed storeId, they MUST use it (unless they are superadmin)
    // For this implementation, we assume if user has storeId, they are restricted.
    // If they have permissions for 'all' or 'manage_stores', they can switch.
    const canManageStores = user.role?.permissions.includes('all') || user.role?.permissions.includes('manage_stores');
    
    if (!canManageStores && user.storeId) {
      activeStoreId = user.storeId;
    }

    if (!activeStoreId) {
      activeStoreId = user.storeId || 'store-default';
    }

    localStorage.setItem('pos_active_store_id', activeStoreId);
    
    const store = allStores.find(s => s.id === activeStoreId) || allStores[0];
    if (store) {
      setCurrentStore(store);
      localStorage.setItem('pos_active_store_id', store.id);
    }
    
    setIsLoading(false);
  }, [isAuthenticated, user, loadStores]);

  useEffect(() => {
    initStore();
  }, [initStore]);

  const switchStore = async (storeId: string) => {
    setIsLoading(true);
    try {
      const store = await db.stores.get(storeId);
      if (store) {
        localStorage.setItem('pos_active_store_id', storeId);
        setCurrentStore(store);
        // Invalidate all queries to force refetch with new store data
        queryClient.invalidateQueries();
        toast.success(`Switched to ${store.name}`);
      }
    } catch (error) {
      toast.error('Failed to switch store');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStores = async () => {
    await loadStores();
  };

  return (
    <StoreContext.Provider value={{ currentStore, stores, isLoading, switchStore, refreshStores }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
