'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

type Section = 'retail' | 'wholesale';

interface SectionContextType {
  section: Section;
  setSection: (section: Section) => void;
  isRetail: boolean;
  isWholesale: boolean;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export function SectionProvider({ children }: { children: React.ReactNode }) {
  const [section, setSectionState] = useState<Section>('retail');
  const [isLoaded, setIsLoaded] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedSection = localStorage.getItem('pos_active_section') as Section;
    if (savedSection && (savedSection === 'retail' || savedSection === 'wholesale')) {
      setSectionState(savedSection);
    }
    setIsLoaded(true);
  }, []);

  const setSection = (newSection: Section) => {
    setSectionState(newSection);
    localStorage.setItem('pos_active_section', newSection);
    // Invalidate all queries to force refetch with new section
    queryClient.invalidateQueries();
  };

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <SectionContext.Provider value={{ 
      section, 
      setSection, 
      isRetail: section === 'retail', 
      isWholesale: section === 'wholesale' 
    }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSection() {
  const context = useContext(SectionContext);
  if (context === undefined) {
    throw new Error('useSection must be used within a SectionProvider');
  }
  return context;
}
