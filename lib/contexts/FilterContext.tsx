"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FilterState, FilterActions, FilterContextType } from '@/lib/types/filter';

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>({
    platforms: [],
    genres: [],
    years: [],
    ratings: []
  });

  const addFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: [...prev[category], value]
    }));
  };

  const removeFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item !== value)
    }));
  };

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => {
      const categoryItems = prev[category];
      const isSelected = categoryItems.includes(value);

      return {
        ...prev,
        [category]: isSelected
          ? categoryItems.filter(item => item !== value)
          : [...categoryItems, value]
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      platforms: [],
      genres: [],
      years: [],
      ratings: []
    });
  };

  const clearCategory = (category: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [category]: []
    }));
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(category => category.length > 0);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((total, category) => total + category.length, 0);
  };

  const value: FilterContextType = {
    ...filters,
    addFilter,
    removeFilter,
    toggleFilter,
    clearFilters,
    clearCategory,
    hasActiveFilters,
    getActiveFilterCount
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};