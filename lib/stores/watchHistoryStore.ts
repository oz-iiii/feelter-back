import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Movie } from "../types/movie";

interface WatchHistoryItem {
  id: string;
  title: string;
  poster: string;
  watchDate: string;
  rating?: number;
  movieData: Movie; // 전체 영화 데이터 저장
}

interface WatchHistoryState {
  watchHistory: WatchHistoryItem[];

  // Actions
  addToWatchHistory: (movie: Movie, rating?: number) => void;
  updateRating: (movieId: string, rating: number) => void;
  removeFromWatchHistory: (movieId: string) => void;
  clearWatchHistory: () => void;
  getRecentHistory: (limit: number) => WatchHistoryItem[];
}

export const useWatchHistoryStore = create<WatchHistoryState>()(
  devtools(
    persist(
      (set, get) => ({
        watchHistory: [],

        addToWatchHistory: (movie: Movie, rating?: number) => {
          const { watchHistory } = get();
<<<<<<< HEAD

=======
>>>>>>> abe31258be7325e87a802d924333371afb885adb
          const currentDate = new Date()
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\./g, ".")
            .replace(" ", "");

          // 이미 시청한 영화인지 확인 (최근 것을 맨 앞으로)
          const existingIndex = watchHistory.findIndex(
            (item) => item.id === movie.id
          );

          const newItem: WatchHistoryItem = {
<<<<<<< HEAD
            id: movie.id.toString(), // 확실히 string으로 변환
=======
            id: String(movie.id),
>>>>>>> abe31258be7325e87a802d924333371afb885adb
            title: movie.title,
            poster: movie.imgUrl,
            watchDate: currentDate,
            rating: rating,
            movieData: movie,
          };

          if (existingIndex !== -1) {
            // 기존 항목이 있으면 제거하고 맨 앞에 추가 (최신순 정렬)
            set((state) => ({
              watchHistory: [
                newItem,
                ...state.watchHistory.filter(
                  (_, index) => index !== existingIndex
                ),
              ],
            }));
          } else {
            // 새로운 항목이면 맨 앞에 추가
            set((state) => ({
              watchHistory: [newItem, ...state.watchHistory],
            }));
          }
        },

        updateRating: (movieId: string, rating: number) => {
          set((state) => ({
            watchHistory: state.watchHistory.map((item) =>
              item.id === movieId ? { ...item, rating } : item
            ),
          }));
        },

        removeFromWatchHistory: (movieId: string) => {
          set((state) => ({
            watchHistory: state.watchHistory.filter(
              (item) => item.id !== movieId
            ),
          }));
        },

        clearWatchHistory: () => {
          set({ watchHistory: [] });
        },

        getRecentHistory: (limit: number) => {
          const { watchHistory } = get();
          return watchHistory.slice(0, limit);
        },
      }),
      {
        name: "watch-history-store", // localStorage key
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const data = JSON.parse(str);
            // Date 객체 복원
            if (data.state?.watchHistory) {
              data.state.watchHistory = data.state.watchHistory.map(
                (item: WatchHistoryItem) => ({
                  ...item,
                  movieData: {
                    ...item.movieData,
                    release: new Date(item.movieData.release),
                    createdAt: new Date(item.movieData.createdAt),
                    updatedAt: new Date(item.movieData.updatedAt),
                  },
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
      name: "watch-history-store",
    }
  )
);
