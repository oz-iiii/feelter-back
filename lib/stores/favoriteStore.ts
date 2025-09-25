import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Movie } from "../types/movie";
import { supabase } from "@/lib/supabase";

interface FavoriteState {
  favorites: Movie[];
  currentUserId: string | null;

  // Actions
  addToFavorites: (movie: Movie) => void;
  removeFromFavorites: (movieId: string | number) => void;
  toggleFavorite: (movie: Movie) => void;
  isFavorite: (movieId: string | number) => boolean;
  clearFavorites: () => void;
  setCurrentUser: (userId: string | null) => void;
  loadUserFavorites: (userId: string) => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  devtools(
    persist(
      (set, get) => ({
        favorites: [],
        currentUserId: null,

        setCurrentUser: (userId: string | null) => {
          const { currentUserId } = get();

          // 사용자가 바뀌면 즐겨찾기 초기화하고 새 사용자 데이터 로드
          if (currentUserId !== userId) {
            set({ currentUserId: userId, favorites: [] });

            if (userId) {
              get().loadUserFavorites(userId);
            }
          }
        },

        loadUserFavorites: (userId: string) => {
          // localStorage에서 해당 사용자의 즐겨찾기 로드
          if (typeof window !== 'undefined') {
            try {
              const userFavorites = localStorage.getItem(`favorites-${userId}`);
              if (userFavorites) {
                const parsedFavorites = JSON.parse(userFavorites);
                // Date 객체 복원
                const favoritesWithDates = parsedFavorites.map((movie: Movie) => ({
                  ...movie,
                  release: new Date(movie.release),
                  createdAt: new Date(movie.createdAt),
                  updatedAt: new Date(movie.updatedAt),
                }));
                set({ favorites: favoritesWithDates });
              }
            } catch (error) {
              console.warn('사용자 즐겨찾기 로드 실패:', error);
            }
          }
        },

        addToFavorites: (movie: Movie) => {
          const { favorites, currentUserId } = get();

          if (!currentUserId) {
            console.warn('로그인된 사용자가 없습니다.');
            return;
          }

          const isAlreadyFavorite = favorites.some(
            (fav) => Number(fav.id) === Number(movie.id)
          );

          if (!isAlreadyFavorite) {
            const newFavorites = [...favorites, movie];
            set({ favorites: newFavorites });

            // 사용자별 localStorage에 저장
            if (typeof window !== 'undefined') {
              localStorage.setItem(`favorites-${currentUserId}`, JSON.stringify(newFavorites));
            }
          }
        },

        removeFromFavorites: (movieId: string | number) => {
          const { currentUserId } = get();

          if (!currentUserId) {
            console.warn('로그인된 사용자가 없습니다.');
            return;
          }

          console.log("Store removeFromFavorites called with:", movieId, typeof movieId);
          set((state) => {
            const before = state.favorites.length;
            const filtered = state.favorites.filter((movie) => {
              const movieIdNum = Number(movie.id);
              const inputIdNum = Number(movieId);
              console.log("Comparing:", movieIdNum, "!==", inputIdNum, "result:", movieIdNum !== inputIdNum);
              return movieIdNum !== inputIdNum;
            });
            console.log("Favorites count:", before, "->", filtered.length);

            // 사용자별 localStorage에 저장
            if (typeof window !== 'undefined') {
              localStorage.setItem(`favorites-${currentUserId}`, JSON.stringify(filtered));
            }

            return { favorites: filtered };
          });
        },

        toggleFavorite: (movie: Movie) => {
          const { favorites, addToFavorites, removeFromFavorites } = get();
          const isAlreadyFavorite = favorites.some(
            (fav) => Number(fav.id) === Number(movie.id)
          );

          if (isAlreadyFavorite) {
            removeFromFavorites(Number(movie.id));
          } else {
            addToFavorites(movie);
          }
        },

        isFavorite: (movieId: string | number) => {
          const { favorites } = get();
          return favorites.some((fav) => Number(fav.id) === Number(movieId));
        },

        clearFavorites: () => {
          const { currentUserId } = get();
          set({ favorites: [] });

          // 사용자별 localStorage에서도 삭제
          if (currentUserId && typeof window !== 'undefined') {
            localStorage.removeItem(`favorites-${currentUserId}`);
          }
        },
      }),
      {
        name: "favorite-store-global", // 전역 상태만 저장 (currentUserId만)
        partialize: (state) => ({ currentUserId: state.currentUserId }), // favorites는 저장하지 않음
      }
    ),
    {
      name: "favorite-store",
    }
  )
);
