import type { Movie, User, Category } from "../components/common/model/types";

// Movie 키 정의
export const MOVIE_KEYS = {
	id: "id",
	tmdbId: "tmdbId",  // API ID 필드
	title: "title",
	poster: "poster",
	year: "year",
	genre: "genre",
	director: "director",
	rating: "rating",
	duration: "duration",
	watchDate: "watchDate",
	addedDate: "addedDate",
} as const satisfies Record<keyof Movie, keyof Movie>;

// User 키 정의
export const USER_KEYS = {
	id: "id",
	profileImage: "profileImage",
	nickname: "nickname",
	email: "email",
	bio: "bio",
	joinDate: "joinDate",
	favoriteGenres: "favoriteGenres",
	favoriteDirectors: "favoriteDirectors",
} as const satisfies Record<keyof User, keyof User>;

// Category 키 정의
export const CATEGORY_KEYS = {
	id: "id",
	name: "name",
	description: "description",
	movieCount: "movieCount",
	isPublic: "isPublic",
	createdDate: "createdDate",
	movies: "movies",
} as const satisfies Record<keyof Category, keyof Category>;

// 타입 정의
export type MovieKey = keyof typeof MOVIE_KEYS;
export type UserKey = keyof typeof USER_KEYS;
export type CategoryKey = keyof typeof CATEGORY_KEYS;

// 필수 키
export const REQUIRED_MOVIE_KEYS = [
	"id",
	"title",
	"poster",
	"genre",
	"director",
	"rating",
] as const satisfies readonly MovieKey[];

// 키 검증
export function isValidMovieKey(key: string): key is MovieKey {
	return key in MOVIE_KEYS;
}

export function isValidUserKey(key: string): key is UserKey {
	return key in USER_KEYS;
}

export function isValidCategoryKey(key: string): key is CategoryKey {
	return key in CATEGORY_KEYS;
}
