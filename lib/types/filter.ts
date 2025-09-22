// 필터 관련 타입 정의

export interface FilterState {
  platforms: string[];
  genres: string[];
  years: string[];
  ratings: string[];
  ages: string[];
  countries: string[];
  runtimes: string[];
}

export interface FilterActions {
  addFilter: (category: keyof FilterState, value: string) => void;
  removeFilter: (category: keyof FilterState, value: string) => void;
  toggleFilter: (category: keyof FilterState, value: string) => void;
  clearFilters: () => void;
  clearCategory: (category: keyof FilterState) => void;
  hasActiveFilters: () => boolean;
  getActiveFilterCount: () => number;
}

export interface FilterContextType extends FilterState, FilterActions {}

// 필터 적용을 위한 유틸리티 타입
export interface FilterableContent {
  title: string;
  year?: number;
  genre?: string;
  rating?: number;
  platform?: string;
}
