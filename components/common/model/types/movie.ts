export interface Movie {
  id: number;
  tmdbId?: number;  // API에서 가져오는 실제 ID
  title: string;
  poster: string;
  year?: number;
  genre: string;
  director: string;
  rating: number;
  duration?: string;
  watchDate?: string;
  addedDate?: string;
}
