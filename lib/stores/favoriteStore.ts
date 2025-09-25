import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Movie } from "../types/movie";

interface FavoriteState {
  favorites: Movie[];

  // Actions
  addToFavorites: (movie: Movie) => void;
  removeFromFavorites: (movieId: string | number) => void;
  toggleFavorite: (movie: Movie) => void;
  isFavorite: (movieId: string | number) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  devtools(
    persist(
      (set, get) => ({
        favorites: [],

        addToFavorites: (movie: Movie) => {
          const { favorites } = get();
          const isAlreadyFavorite = favorites.some(
            (fav) => Number(fav.id) === Number(movie.id)
          );

          if (!isAlreadyFavorite) {
            set((state) => ({
              favorites: [...state.favorites, movie],
            }));
          }
        },

        removeFromFavorites: (movieId: string | number) => {
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
          set({ favorites: [] });
        },
      }),
      {
        name: "favorite-store", // localStorage key
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const data = JSON.parse(str);
            // Date 객체 복원
            if (data.state?.favorites) {
              data.state.favorites = data.state.favorites.map(
                (movie: Movie) => ({
                  ...movie,
                  release: new Date(movie.release),
                  createdAt: new Date(movie.createdAt),
                  updatedAt: new Date(movie.updatedAt),
                })
              );
            }
            return data;
          },
          setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    ),
    {
      name: "favorite-store",
    }
  )
);
