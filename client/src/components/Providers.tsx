'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { SectionProvider } from '@/context/SectionContext';
import { StoreProvider } from '@/context/StoreContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <SectionProvider>
            {children}
          </SectionProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
