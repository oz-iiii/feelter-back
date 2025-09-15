import { FilterState } from '@/lib/types/filter';
import { ContentItem } from '@/lib/data';

/**
 * 평점 문자열을 숫자로 변환
 */
function parseRatingFilter(ratingFilter: string): number {
  const match = ratingFilter.match(/(\d+)점 이상/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * 플랫폼 필터 적용
 */
function applyPlatformFilter(items: ContentItem[], platformFilters: string[]): ContentItem[] {
  if (platformFilters.length === 0) return items;

  // 현재 ContentItem에 platform 필드가 없으므로 임시로 모든 항목 반환
  // 실제 구현시에는 각 영화의 스트리밍 플랫폼 정보를 확인해야 함
  return items;
}

/**
 * 장르 필터 적용
 */
function applyGenreFilter(items: ContentItem[], genreFilters: string[]): ContentItem[] {
  if (genreFilters.length === 0) return items;

  return items.filter(item => {
    if (!item.genre) return false;
    return genreFilters.some(filter =>
      item.genre?.includes(filter)
    );
  });
}

/**
 * 연도 필터 적용
 */
function applyYearFilter(items: ContentItem[], yearFilters: string[]): ContentItem[] {
  if (yearFilters.length === 0) return items;

  return items.filter(item => {
    if (!item.year) return false;
    return yearFilters.some(filter =>
      item.year?.toString() === filter
    );
  });
}

/**
 * 평점 필터 적용
 */
function applyRatingFilter(items: ContentItem[], ratingFilters: string[]): ContentItem[] {
  if (ratingFilters.length === 0) return items;

  return items.filter(item => {
    if (!item.rating) return false;

    return ratingFilters.some(filter => {
      const minRating = parseRatingFilter(filter);
      return (item.rating || 0) >= minRating;
    });
  });
}

/**
 * 모든 필터를 적용하여 컨텐츠 목록을 필터링
 */
export function applyFilters(items: ContentItem[], filters: FilterState): ContentItem[] {
  let filteredItems = [...items];

  // 각 필터를 순차적으로 적용
  filteredItems = applyPlatformFilter(filteredItems, filters.platforms);
  filteredItems = applyGenreFilter(filteredItems, filters.genres);
  filteredItems = applyYearFilter(filteredItems, filters.years);
  filteredItems = applyRatingFilter(filteredItems, filters.ratings);

  return filteredItems;
}

/**
 * 활성 필터가 있는지 확인
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return Object.values(filters).some(category => category.length > 0);
}

/**
 * 활성 필터 개수 계산
 */
export function getActiveFilterCount(filters: FilterState): number {
  return Object.values(filters).reduce((total, category) => total + category.length, 0);
}

/**
 * 필터 상태를 사람이 읽을 수 있는 형태로 변환
 */
export function getFilterSummary(filters: FilterState): string[] {
  const summary: string[] = [];

  if (filters.platforms.length > 0) {
    summary.push(`플랫폼: ${filters.platforms.join(', ')}`);
  }
  if (filters.genres.length > 0) {
    summary.push(`장르: ${filters.genres.join(', ')}`);
  }
  if (filters.years.length > 0) {
    summary.push(`연도: ${filters.years.join(', ')}`);
  }
  if (filters.ratings.length > 0) {
    summary.push(`평점: ${filters.ratings.join(', ')}`);
  }

  return summary;
}