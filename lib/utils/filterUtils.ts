import { FilterState } from "@/lib/types/filter";
import { ContentItem } from "@/lib/data";

/**
 * 평점 라벨을 구간(min, maxExclusive)으로 변환
 */
function getRatingRange(
  label: string
): { min: number; maxExclusive: number } | null {
  const m = label.match(/(\d+)\s*점\s*이상\s*~\s*(\d+)\s*점\s*미만/);
  if (m) {
    const min = parseInt(m[1], 10);
    const max = parseInt(m[2], 10);
    return { min, maxExclusive: max };
  }
  const single = label.match(/(\d+)\s*점\s*이상/);
  if (single) {
    const min = parseInt(single[1], 10);
    return { min, maxExclusive: 11 };
  }
  return null;
}

/**
 * 플랫폼 필터 적용
 */
function applyPlatformFilter(
  items: ContentItem[],
  platformFilters: string[]
): ContentItem[] {
  if (platformFilters.length === 0) return items;

  return items.filter((item) => {
    if (!item.platform) return false;

    // platform이 배열인 경우와 문자열인 경우 모두 처리
    const platforms = Array.isArray(item.platform)
      ? item.platform
      : [item.platform];
    return platformFilters.some((filter) =>
      platforms.some((platform) => platform.includes(filter))
    );
  });
}

/**
 * 장르 필터 적용
 */
function applyGenreFilter(
  items: ContentItem[],
  genreFilters: string[]
): ContentItem[] {
  if (genreFilters.length === 0) return items;

  return items.filter((item) => {
    if (!item.genre) return false;

    // genre가 배열인 경우와 문자열인 경우 모두 처리
    const genres = Array.isArray(item.genre) ? item.genre : [item.genre];
    return genreFilters.some((filter) =>
      genres.some((genre) => genre.includes(filter))
    );
  });
}

/**
 * 연도 필터 적용 (10년대 그룹)
 */
function applyYearFilter(
  items: ContentItem[],
  yearFilters: string[]
): ContentItem[] {
  if (yearFilters.length === 0) return items;

  return items.filter((item) => {
    if (!item.year) return false;

    return yearFilters.some((filter) => {
      const currentYear = item.year!;
      switch (filter) {
        case "2020년대":
          return currentYear >= 2020 && currentYear <= 2029;
        case "2010년대":
          return currentYear >= 2010 && currentYear <= 2019;
        case "2000년대":
          return currentYear >= 2000 && currentYear <= 2009;
        case "1990년대":
          return currentYear >= 1990 && currentYear <= 1999;
        case "1980년대":
          return currentYear >= 1980 && currentYear <= 1989;
        default:
          return false;
      }
    });
  });
}

/**
 * 평점 필터 적용
 */
function applyRatingFilter(
  items: ContentItem[],
  ratingFilters: string[]
): ContentItem[] {
  if (ratingFilters.length === 0) return items;

  return items.filter((item) => {
    if (typeof item.rating !== "number") return false;
    return ratingFilters.some((label) => {
      const range = getRatingRange(label);
      if (!range) return false;
      const r = item.rating!;
      return r >= range.min && r < range.maxExclusive;
    });
  });
}

/**
 * 연령 표기 정규화
 */
function normalizeAge(value: string): string {
  const v = value.replace(/\s+/g, "").toLowerCase();
  if (/(전체|all|g)/.test(v)) return "전체관람가";
  if (/^(12|12세|12세관람가)$/.test(v)) return "12세";
  if (/^(15|15세|15세관람가)$/.test(v)) return "15세";
  if (/(19|청소년관람불가|청불|r|성인)/.test(v)) return "18세";
  if (v.includes("관람가")) {
    if (v.includes("12")) return "12세";
    if (v.includes("15")) return "15세";
  }
  return value;
}

/**
 * 연령 등급 필터 적용
 */
function applyAgeFilter(
  items: ContentItem[],
  ageFilters: string[]
): ContentItem[] {
  if (ageFilters.length === 0) return items;

  const normalizedTargets = ageFilters.map(normalizeAge);
  return items.filter((item) => {
    if (!item.age) return false;
    const itemAge = normalizeAge(item.age);
    return normalizedTargets.includes(itemAge);
  });
}

/**
 * 제작국가 필터 적용
 */
function applyCountryFilter(
  items: ContentItem[],
  countryFilters: string[]
): ContentItem[] {
  if (countryFilters.length === 0) return items;

  // 국내 판정: 한국/대한민국/Korea 변형을 폭넓게 허용
  const isDomesticCountry = (value: string): boolean => {
    const v = String(value).trim().toLowerCase();
    return (
      v.includes("한국") ||
      v.includes("대한민국") ||
      v.includes("south korea") ||
      v.includes("republic of korea") ||
      v === "kor" ||
      v.includes("korea")
    );
  };

  return items.filter((item) => {
    if (!item.country) return false;
    const countries = Array.isArray(item.country)
      ? item.country
      : [item.country];
    const isDomestic = countries.some((c) => isDomesticCountry(c));

    return countryFilters.some((filter) => {
      switch (filter) {
        case "국내":
          return isDomestic;
        case "해외(주요국)":
        case "해외(기타)":
          // 현재 요구사항: 두 해외 옵션 모두 동일하게 해외(국내 제외)로 처리
          return !isDomestic;
        default:
          return false;
      }
    });
  });
}

/**
 * 상영시간 필터 적용
 */
function applyRuntimeFilter(
  items: ContentItem[],
  runtimeFilters: string[]
): ContentItem[] {
  if (runtimeFilters.length === 0) return items;

  return items.filter((item) => {
    if (!item.runtime) return false;

    // runtime에서 숫자만 추출 (예: "120분" -> 120)
    const runtimeMatch = item.runtime.match(/(\d+)/);
    if (!runtimeMatch) return false;

    const runtime = parseInt(runtimeMatch[1]);

    return runtimeFilters.some((filter) => {
      switch (filter) {
        case "90분 이하":
          return runtime <= 90;
        case "90-120분":
          return runtime > 90 && runtime <= 120;
        case "120-150분":
          return runtime > 120 && runtime <= 150;
        case "150분 이상":
          return runtime > 150;
        default:
          return false;
      }
    });
  });
}

/**
 * 모든 필터를 적용하여 컨텐츠 목록을 필터링
 */
export function applyFilters(
  items: ContentItem[],
  filters: FilterState
): ContentItem[] {
  let filteredItems = [...items];

  // 각 필터를 순차적으로 적용
  filteredItems = applyPlatformFilter(filteredItems, filters.platforms);
  filteredItems = applyGenreFilter(filteredItems, filters.genres);
  filteredItems = applyYearFilter(filteredItems, filters.years);
  filteredItems = applyRatingFilter(filteredItems, filters.ratings);
  filteredItems = applyAgeFilter(filteredItems, filters.ages);
  // 국가 필터는 기준 정해졌으므로 적용 (간소화된 라벨 기반)
  filteredItems = applyCountryFilter(filteredItems, filters.countries);
  // 상영시간 필터 적용
  filteredItems = applyRuntimeFilter(filteredItems, filters.runtimes);

  return filteredItems;
}

/**
 * 활성 필터가 있는지 확인
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return Object.values(filters).some((category) => category.length > 0);
}

/**
 * 활성 필터 개수 계산
 */
export function getActiveFilterCount(filters: FilterState): number {
  return Object.values(filters).reduce(
    (total, category) => total + category.length,
    0
  );
}

/**
 * 필터 상태를 사람이 읽을 수 있는 형태로 변환
 */
export function getFilterSummary(filters: FilterState): string[] {
  const summary: string[] = [];

  if (filters.platforms.length > 0) {
    summary.push(`플랫폼: ${filters.platforms.join(", ")}`);
  }
  if (filters.genres.length > 0) {
    summary.push(`장르: ${filters.genres.join(", ")}`);
  }
  if (filters.years.length > 0) {
    summary.push(`연도: ${filters.years.join(", ")}`);
  }
  if (filters.ratings.length > 0) {
    summary.push(`평점: ${filters.ratings.join(", ")}`);
  }
  if (filters.ages.length > 0) {
    summary.push(`연령: ${filters.ages.join(", ")}`);
  }
  if (filters.countries.length > 0) {
    summary.push(`국가: ${filters.countries.join(", ")}`);
  }
  if (filters.runtimes.length > 0) {
    summary.push(`상영시간: ${filters.runtimes.join(", ")}`);
  }

  return summary;
}
