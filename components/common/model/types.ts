// UI Movie interface for legacy compatibility
export interface Movie {
  id: number;
  title: string;
  director: string;
  year?: number;
  genre: string;
  duration?: string;
  rating: number;
  poster: string;
  addedDate?: string;
  watchDate?: string;
}

// Re-export other types
export type { MovieFilters } from '@/lib/types/movie';

// Additional types for the UI components
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

export interface User {
  id: number;
  nickname: string;
  email: string;
  bio: string;
  profileImage: string;
  joinDate: string;
  favoriteGenres: string[];
  favoriteDirectors: string[];
}