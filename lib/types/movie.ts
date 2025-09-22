export interface Movie {
  id: string | number;
  tmdbid: number;
  title: string;
  release: Date; // 개봉일
  age: string; // 연령 등급
  genre: string | string[]; // 장르
  runningTime: string; // 상영시간
  country: string | string[]; // 제작국가
  director: string | string[]; // 감독
  actor: string | string[]; // 배우
  overview: string; // 줄거리
  streaming: string | string[]; // 스트리밍 플랫폼
  streamingUrl: string; // 스트리밍 URL
  youtubeUrl: string; // 유튜브 예고편 URL
  imgUrl: string; // 포스터 이미지 URL
  bgUrl: string; // 배경 이미지 URL
  feelterTime: string | string[]; // 필터 추천 시간대
  feelterPurpose: string | string[]; // 필터 추천 목적
  feelterOccasion: string | string[]; // 필터 추천 상황
  rating?: number; // 네티즌 평점 (contents 테이블에서 가져옴)
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieFilters {
  title?: string;
  year?: number;
  genre?: string;
  streaming?: string;
  age?: string;
  country?: string;
  feelterTime?: string;
  feelterPurpose?: string;
  feelterOccasion?: string;
  sortBy?: "release" | "title";
  sortOrder?: "asc" | "desc";
}

export interface MovieRanking {
  id: number;
  rank: number;
  movieId: string;
  movie: Movie;
  bestComment: string;
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  movieCount: number;
  isPublic: boolean;
  createdDate: string;
  movies: CategoryMovie[];
}

export interface CategoryMovie {
  id: number;
  title: string;
  poster: string;
}

// 데이터 타입 정의
export interface ContentData {
  id: number;
  ott_name: string;
  title: string;
  year: string;
  age: string;
  genre: string;
  country: string;
  runningtime: string;
  director: string;
  actor: string;
  description: string;
  image_url: string;
  video_url: string;
  is_hero: boolean;
}

// HeroCarousel 컴포넌트의 데이터 타입 정의
export interface HeroData {
  id: number;
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
}

// CardCarousel 슬라이드 아이템의 데이터 타입 정의
export interface SlideData extends HeroData {
  id: number;
}

// OTT별 콘텐츠 데이터의 전체 타입 정의
export interface OttContent {
  name: string;
  hero: HeroData;
  slides: SlideData[];
}
