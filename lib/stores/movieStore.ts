import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Movie, MovieFilters } from "../types/movie";
import { movieService } from "../services/movieService";

interface MovieState {
  movies: Movie[];
  currentMovie: Movie | null;
  loading: boolean;
  error: string | null;
  filters: MovieFilters;
  hasMore: boolean;

  // Actions
  fetchMovies: () => Promise<void>;
  fetchMovieById: (id: string) => Promise<void>;
  searchMovies: (filters: MovieFilters, reset?: boolean) => Promise<void>;
  loadMoreMovies: () => Promise<void>;
  setCurrentMovie: (movie: Movie | null) => void;
  setFilters: (filters: MovieFilters) => void;
  clearError: () => void;
}

export const useMovieStore = create<MovieState>()(
  devtools(
    (set, get) => ({
        movies: [],
        currentMovie: null,
        loading: false,
        error: null,
        filters: {},
        hasMore: true,

      fetchMovies: async () => {
        const { movies, loading } = get();
        
        // 이미 로딩 중이거나 영화 데이터가 있으면 다시 fetch하지 않음
        if (loading || movies.length > 0) {
          return;
        }
        
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/movies');
          const result = await response.json();
          
          if (result.success) {
            set({ movies: result.data, loading: false });
          } else {
            throw new Error(result.error || "Failed to fetch movies");
          }
        } catch (error) {
          set({
            movies: [],
            loading: false,
            error: error instanceof Error ? error.message : "영화 데이터를 불러오는데 실패했습니다.",
          });
        }
      },

      fetchMovieById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const movie = await movieService.getMovieById(id);
          set({ currentMovie: movie, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "영화를 불러오는데 실패했습니다.",
            loading: false,
          });
        }
      },

      searchMovies: async (filters: MovieFilters, reset: boolean = true) => {
        set({ loading: true, error: null });
        try {
          const { movies, hasMore: newHasMore } = await movieService.getFilteredMovies(
            filters,
            20,
            0
          );

          if (reset) {
            set({
              movies,
              hasMore: newHasMore,
              loading: false,
            });
          } else {
            set((state) => ({
              movies: [...state.movies, ...movies],
              hasMore: newHasMore,
              loading: false,
            }));
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "검색에 실패했습니다.",
            loading: false,
          });
        }
      },

      loadMoreMovies: async () => {
        const { hasMore, filters, movies } = get();
        if (!hasMore) return;

        const currentPage = Math.floor(movies.length / 20);
        
        set({ loading: true });
        try {
          const { movies: newMovies, hasMore: newHasMore } =
            await movieService.getFilteredMovies(filters, 20, currentPage + 1);

          set((state) => ({
            movies: [...state.movies, ...newMovies],
            hasMore: newHasMore,
            loading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "더 많은 영화를 불러오는데 실패했습니다.",
            loading: false,
          });
        }
      },

      setCurrentMovie: (movie: Movie | null) => {
        set({ currentMovie: movie });
      },

      setFilters: (filters: MovieFilters) => {
        set({ filters });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "movie-store",
    }
  )
);
