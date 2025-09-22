// store/contentStore.ts
"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import contentService from "@/lib/services/contentService";
import type { Content, ContentFilters } from "@/lib/types/content";

interface ContentState {
  // 상태 데이터
  contents: Content[];
  filteredContents: Content[];
  popularContents: Content[];
  latestContents: Content[];
  currentContent: Content | null;
  searchResults: Content[];

  // 로딩 상태들
  isLoading: boolean;
  isFilterLoading: boolean;
  isSearchLoading: boolean;

  // 에러 상태
  error: string | null;

  // 필터 상태
  filters: ContentFilters;

  // 검색 상태
  searchTerm: string;

  // 페이지네이션
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

interface ContentActions {
  // 데이터 페칭 액션들
  fetchAllContents: () => Promise<void>;
  fetchFilteredContents: (
    newFilters?: ContentFilters,
    selectedOtts?: string[]
  ) => Promise<void>;
  fetchPopularContents: (limit?: number) => Promise<void>;
  fetchLatestContents: (limit?: number) => Promise<void>;
  fetchContentById: (contentId: number) => Promise<void>;
  fetchRandomRecommendations: (count?: number) => Promise<void>;
  fetchContentsByPlatform: (platform: string) => Promise<void>;
  searchContents: (searchTerm: string) => Promise<void>;

  // 필터 액션들
  setFilters: (
    newFilters: ContentFilters,
    selectedOtts?: string[]
  ) => Promise<void>;
  setFiltersWithOTT: (
    newFilters: ContentFilters,
    selectedOtts: string[]
  ) => Promise<void>;
  toggleFilter: (
    category: keyof ContentFilters,
    value: string
  ) => Promise<void>;
  clearAllFilters: () => Promise<void>;

  // 검색 액션들
  clearSearch: () => void;

  // 페이지네이션 액션들
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;

  // 유틸리티 액션들
  getCurrentPageContents: () => Content[];
  getTotalPages: () => number;
  clearError: () => void;
  resetStore: () => void;
  hasActiveFilters: () => boolean;
  getActiveFilterCount: () => number;
  refreshData: () => Promise<void>;
}

type ContentStore = ContentState & ContentActions;

const initialState: ContentState = {
  contents: [],
  filteredContents: [],
  popularContents: [],
  latestContents: [],
  currentContent: null,
  searchResults: [],
  isLoading: false,
  isFilterLoading: false,
  isSearchLoading: false,
  error: null,
  filters: {
    time: [],
    purpose: [],
    occasion: [],
  },
  searchTerm: "",
  currentPage: 1,
  itemsPerPage: 12,
  totalItems: 0,
};

export const useContentStore = create<ContentStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      /**
       * 모든 콘텐츠 가져오기
       */
      fetchAllContents: async () => {
        set({ isLoading: true, error: null });
        try {
          const contents = await contentService.getAllContents();
          set({
            contents,
            filteredContents: contents,
            totalItems: contents.length,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "콘텐츠를 가져오는데 실패했습니다.";
          set({ error: errorMessage, isLoading: false });
        }
      },

      /**
       * 필터된 콘텐츠 가져오기 (OTT 플랫폼 필터링 포함)
       */
      fetchFilteredContents: async (
        newFilters?: ContentFilters,
        selectedOtts?: string[]
      ) => {
        set({ isFilterLoading: true, error: null });
        try {
          const filtersToUse = newFilters || get().filters;
          const filteredContents = await contentService.getFilteredContents(
            filtersToUse,
            selectedOtts
          );

          set({
            filteredContents,
            totalItems: filteredContents.length,
            currentPage: 1, // 필터 변경시 첫 페이지로
            isFilterLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "필터링에 실패했습니다.";
          set({ error: errorMessage, isFilterLoading: false });
        }
      },

      /**
       * 필터 설정 및 적용 (OTT 플랫폼 필터 선택적 지원)
       */
      setFilters: async (
        newFilters: ContentFilters,
        selectedOtts?: string[]
      ) => {
        set({ filters: newFilters });
        await get().fetchFilteredContents(newFilters, selectedOtts);
      },

      /**
       * 필터 설정 및 적용 (OTT 플랫폼 필터 포함)
       */
      setFiltersWithOTT: async (
        newFilters: ContentFilters,
        selectedOtts: string[]
      ) => {
        set({ filters: newFilters });
        await get().fetchFilteredContents(newFilters, selectedOtts);
      },

      /**
       * 단일 필터 토글
       */
      toggleFilter: async (category: keyof ContentFilters, value: string) => {
        const currentFilters = get().filters;
        const categoryFilters = currentFilters[category];

        const newCategoryFilters = categoryFilters.includes(value)
          ? categoryFilters.filter((item) => item !== value)
          : [...categoryFilters, value];

        const newFilters: ContentFilters = {
          ...currentFilters,
          [category]: newCategoryFilters,
        };

        await get().setFilters(newFilters);
      },

      /**
       * 모든 필터 초기화
       */
      clearAllFilters: async () => {
        const emptyFilters: ContentFilters = {
          time: [],
          purpose: [],
          occasion: [],
        };
        await get().setFilters(emptyFilters);
      },

      /**
       * 콘텐츠 검색
       */
      searchContents: async (searchTerm: string) => {
        if (!searchTerm.trim()) {
          set({ searchResults: [], searchTerm: "" });
          return;
        }

        set({ isSearchLoading: true, error: null, searchTerm });
        try {
          const searchResults = await contentService.searchContents(searchTerm);
          set({
            searchResults,
            isSearchLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "검색에 실패했습니다.";
          set({ error: errorMessage, isSearchLoading: false });
        }
      },

      /**
       * 검색 초기화
       */
      clearSearch: () => {
        set({ searchResults: [], searchTerm: "" });
      },

      /**
       * 인기 콘텐츠 가져오기
       */
      fetchPopularContents: async (limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const popularContents = await contentService.getPopularContents(
            limit
          );
          set({
            popularContents,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "인기 콘텐츠를 가져오는데 실패했습니다.";
          set({ error: errorMessage, isLoading: false });
        }
      },

      /**
       * 최신 콘텐츠 가져오기
       */
      fetchLatestContents: async (limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const latestContents = await contentService.getLatestContents(limit);
          set({
            latestContents,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "최신 콘텐츠를 가져오는데 실패했습니다.";
          set({ error: errorMessage, isLoading: false });
        }
      },

      /**
       * 단일 콘텐츠 상세 정보 가져오기
       */
      fetchContentById: async (contentId: number) => {
        set({ isLoading: true, error: null, currentContent: null });
        try {
          const content = await contentService.getContentById(contentId);
          set({
            currentContent: content,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "콘텐츠 정보를 가져오는데 실패했습니다.";
          set({ error: errorMessage, isLoading: false });
        }
      },

      /**
       * 랜덤 추천 콘텐츠 가져오기
       */
      fetchRandomRecommendations: async (count = 5) => {
        set({ isLoading: true, error: null });
        try {
          const recommendations = await contentService.getRandomRecommendations(
            count
          );
          set({
            filteredContents: recommendations,
            totalItems: recommendations.length,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "추천 콘텐츠를 가져오는데 실패했습니다.";
          set({ error: errorMessage, isLoading: false });
        }
      },

      /**
       * 플랫폼별 콘텐츠 가져오기
       */
      fetchContentsByPlatform: async (platform: string) => {
        set({ isLoading: true, error: null });
        try {
          const contents = await contentService.getContentsByPlatform(platform);
          set({
            filteredContents: contents,
            totalItems: contents.length,
            currentPage: 1,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "플랫폼 콘텐츠를 가져오는데 실패했습니다.";
          set({ error: errorMessage, isLoading: false });
        }
      },

      /**
       * 페이지 변경
       */
      setCurrentPage: (page: number) => {
        set({ currentPage: page });
      },

      /**
       * 페이지당 아이템 수 변경
       */
      setItemsPerPage: (itemsPerPage: number) => {
        set({ itemsPerPage, currentPage: 1 });
      },

      /**
       * 현재 페이지의 콘텐츠 가져오기 (계산된 값)
       */
      getCurrentPageContents: (): Content[] => {
        const {
          filteredContents,
          currentPage,
          itemsPerPage,
          searchResults,
          searchTerm,
        } = get();
        const contentsToUse = searchTerm ? searchResults : filteredContents;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return contentsToUse.slice(startIndex, endIndex);
      },

      /**
       * 전체 페이지 수 계산
       */
      getTotalPages: (): number => {
        const { totalItems, itemsPerPage, searchResults, searchTerm } = get();
        const itemCount = searchTerm ? searchResults.length : totalItems;
        return Math.ceil(itemCount / itemsPerPage);
      },

      /**
       * 에러 초기화
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * 스토어 초기화
       */
      resetStore: () => {
        set(initialState);
      },

      /**
       * 필터 상태 확인 (활성화된 필터가 있는지)
       */
      hasActiveFilters: (): boolean => {
        const { filters } = get();
        return (
          filters.time.length > 0 ||
          filters.purpose.length > 0 ||
          filters.occasion.length > 0
        );
      },

      /**
       * 활성 필터 개수 반환
       */
      getActiveFilterCount: (): number => {
        const { filters } = get();
        return (
          filters.time.length + filters.purpose.length + filters.occasion.length
        );
      },

      /**
       * 데이터 새로고침
       */
      refreshData: async () => {
        const { hasActiveFilters, fetchFilteredContents, fetchAllContents } =
          get();

        if (hasActiveFilters()) {
          await fetchFilteredContents();
        } else {
          await fetchAllContents();
        }
      },
    }),
    {
      name: "content-store",
    }
  )
);

// 선택적 셀렉터들
export const useContents = () =>
  useContentStore((state) => state.filteredContents);
export const useFilters = () => useContentStore((state) => state.filters);
export const useIsLoading = () => useContentStore((state) => state.isLoading);
export const useCurrentPageContents = () =>
  useContentStore((state) => state.getCurrentPageContents());
export const usePagination = () =>
  useContentStore((state) => ({
    currentPage: state.currentPage,
    totalPages: state.getTotalPages(),
    itemsPerPage: state.itemsPerPage,
    totalItems: state.totalItems,
  }));

export default useContentStore;
