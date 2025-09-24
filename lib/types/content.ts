/**
 * OTT 플랫폼 정보 인터페이스
 */
export interface OTTPlatformInfo {
  name: string;
  url: string;
}

export interface Content {
  contentsid: number;
  title: string;
  release: string;
  age: string;
  genres: string[];
  runningtime: string;
  countries: string[];
  directors: string[];
  actors: string[];
  overview: string;
  netizenRating: string;
  imgUrl: string;
  bgUrl?: string;
  youtubeUrl?: string;
  feelterTime: string[] | string; // 실제 DB 필드명
  feelterPurpose: string[] | string; // 실제 DB 필드명
  feelterOccasion: string[] | string; // 실제 DB 필드명
  ottplatforms: OTTPlatformInfo[] | string; // JSONB로 저장된 플랫폼 정보
  bestcoment: string;

  // 메타데이터
  view_count?: number;
  like_count?: number;
  is_featured?: boolean;
}

// 콘텐츠 데이터 타입 정의
export interface RankingData {
  id: number;
  rank: number;
  title: string;
  year: string;
  age: string;
  genre: string;
  country: string;
  runningtime: string;
  director: string;
  actor: string;
  description: string;
  imageUrl?: string;
  videoUrl: string;
  bestComment: string;
}

/**
 * 콘텐츠 필터 인터페이스
 */
export interface ContentFilters {
  time: string[];
  purpose: string[];
  occasion: string[];
}

/**
 * 필터 옵션 정의
 */
export const FILTER_OPTIONS = {
  time: ["이동", "취침", "식사", "심심", "휴일/주말"] as const,
  purpose: ["감동", "설렘", "웃음", "몰입", "통쾌"] as const,
  occasion: ["혼자", "연인", "친구", "가족", "아이"] as const,
} as const;

/**
 * 필터 카테고리 타입
 */
export type FilterCategory = keyof typeof FILTER_OPTIONS;

/**
 * 각 필터 카테고리의 값 타입들
 */
export type TimeFilter = (typeof FILTER_OPTIONS.time)[number];
export type PurposeFilter = (typeof FILTER_OPTIONS.purpose)[number];
export type OccasionFilter = (typeof FILTER_OPTIONS.occasion)[number];

/**
 * 모든 필터 값의 유니온 타입
 */
export type FilterValue = TimeFilter | PurposeFilter | OccasionFilter;

/**
 * OTT 플랫폼 타입
 */
export type OTTPlatform =
  | "Netflix"
  | "Disney+"
  | "Amazon Prime"
  | "HBO Max"
  | "Apple TV+"
  | "Paramount+"
  | "Hulu"
  | "Peacock"
  | "Watcha"
  | "Tving"
  | "Wavve"
  | "Coupang Play"
  | "YouTube Premium"
  | "Other";

/**
 * 콘텐츠 장르 타입
 */
export type ContentGenre =
  | "액션"
  | "어드벤처"
  | "코미디"
  | "드라마"
  | "판타지"
  | "공포"
  | "미스터리"
  | "로맨스"
  | "SF"
  | "스릴러"
  | "서부"
  | "애니메이션"
  | "다큐멘터리"
  | "가족"
  | "음악"
  | "전쟁"
  | "역사"
  | "범죄"
  | "바이오그래피"
  | "스포츠"
  | "뮤지컬"
  | "TV쇼"
  | "리얼리티"
  | "토크쇼"
  | "뉴스"
  | "교육"
  | "기타";

/**
 * 콘텐츠 타입 (영화/시리즈)
 */
export type ContentType = "movie" | "series" | "documentary" | "show" | "anime";

/**
 * 연령 등급
 */
export type AgeRating = "ALL" | "7+" | "12+" | "15+" | "19+" | "R";

/**
 * API 응답 래퍼 인터페이스
 */
export interface APIResponse<T = unknown> {
  data: T;
  error?: string;
  message?: string;
  success: boolean;
}

/**
 * 콘텐츠 목록 응답 인터페이스
 */
export interface ContentListResponse extends APIResponse<Content[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 단일 콘텐츠 응답 인터페이스
 */
export type ContentResponse = APIResponse<Content>;

/**
 * 검색 파라미터 인터페이스
 */
export interface SearchParams {
  query: string;
  filters?: Partial<ContentFilters>;
  platform?: OTTPlatform;
  genre?: ContentGenre;
  minRating?: number;
  maxRating?: number;
  releaseYear?: number;
  contentType?: ContentType;
  sortBy?: "rating" | "release_year" | "title" | "created_at" | "view_count";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * 페이지네이션 인터페이스
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * 콘텐츠 통계 인터페이스
 */
export interface ContentStats {
  totalContents: number;
  contentsByPlatform: Record<OTTPlatform, number>;
  contentsByGenre: Record<ContentGenre, number>;
  averageRating: number;
  topRatedContents: Content[];
  mostPopularContents: Content[];
  recentlyAddedContents: Content[];
}

/**
 * 사용자 선호도 인터페이스 (추후 기능 확장용)
 */
export interface UserPreferences {
  favoriteGenres: ContentGenre[];
  favoriteplatforms: OTTPlatform[];
  preferredFilters: ContentFilters;
  watchedContents: number[];
  wishlistContents: number[];
  ratings: Record<number, number>; // contentId -> rating
}

/**
 * 추천 시스템 파라미터
 */
export interface RecommendationParams {
  userId?: string;
  basedOnContent?: number; // 특정 콘텐츠 기반 추천
  filters?: ContentFilters;
  excludeWatched?: boolean;
  limit?: number;
  diversityFactor?: number; // 0-1, 추천 다양성 조절
}

/**
 * 콘텐츠 생성/수정 입력 인터페이스
 */
export interface ContentInput {
  title: string;
  platform: OTTPlatform;
  genre: ContentGenre;
  rating: number;
  duration: string;
  time: TimeFilter[];
  purpose: PurposeFilter[];
  occasion: OccasionFilter[];
  poster?: string;
  description?: string;
  director?: string;
  cast?: string[];
  release_year?: number;
  country?: string;
  language?: string;
  age_rating?: AgeRating;
  tags?: string[];
  content_type?: ContentType;
}

/**
 * 콘텐츠 업데이트 인터페이스 (모든 필드가 선택적)
 */
export interface ContentUpdate extends Partial<ContentInput> {
  id: number;
}

/**
 * Supabase 테이블 행 타입 (데이터베이스 스키마와 일치)
 */
export interface ContentRow {
  id: number;
  title: string;
  platform: string;
  genre: string;
  rating: number;
  duration: string;
  poster: string | null;
  description: string | null;
  director: string | null;
  cast: string[] | null;
  release_year: number | null;
  country: string | null;
  language: string | null;
  age_rating: string | null;
  tags: string[] | null;
  time: string[];
  purpose: string[];
  occasion: string[];
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
  is_featured: boolean;
}

/**
 * 에러 타입 정의
 */
export interface ContentError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * 로딩 상태 타입
 */
export interface LoadingState {
  isLoading: boolean;
  isFilterLoading: boolean;
  isSearchLoading: boolean;
  error: string | null;
}

/**
 * 필터 상태 헬퍼 함수들을 위한 타입
 */
export interface FilterHelpers {
  hasActiveFilters: (filters: ContentFilters) => boolean;
  getActiveFilterCount: (filters: ContentFilters) => number;
  isFilterActive: (
    filters: ContentFilters,
    category: FilterCategory,
    value: string
  ) => boolean;
  resetFilters: () => ContentFilters;
}

/**
 * 콘텐츠 카드 표시용 간소화된 인터페이스
 */
export interface ContentCard {
  id: number;
  title: string;
  platform: string;
  genre: string;
  rating: number;
  duration: string;
  poster?: string;
  time: string[];
  purpose: string[];
  occasion: string[];
}

/**
 * 콘텐츠 상세 페이지용 확장된 인터페이스
 */
export interface ContentDetail extends Content {
  similar_contents?: ContentCard[];
  reviews?: Review[];
  streaming_info?: StreamingInfo;
}

/**
 * 리뷰 인터페이스 (추후 기능 확장용)
 */
export interface Review {
  id: number;
  content_id: number;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
}

/**
 * 스트리밍 정보 인터페이스
 */
export interface StreamingInfo {
  available_regions: string[];
  subscription_required: boolean;
  rental_price?: number;
  purchase_price?: number;
  free_with_ads?: boolean;
  hd_available: boolean;
  four_k_available: boolean;
  download_available: boolean;
}

/**
 * 타입 가드 함수들
 */
export const isValidTimeFilter = (value: string): value is TimeFilter => {
  return FILTER_OPTIONS.time.includes(value as TimeFilter);
};

export const isValidPurposeFilter = (value: string): value is PurposeFilter => {
  return FILTER_OPTIONS.purpose.includes(value as PurposeFilter);
};

export const isValidOccasionFilter = (
  value: string
): value is OccasionFilter => {
  return FILTER_OPTIONS.occasion.includes(value as OccasionFilter);
};

export const isValidFilterCategory = (
  category: string
): category is FilterCategory => {
  return ["time", "purpose", "occasion"].includes(category);
};
