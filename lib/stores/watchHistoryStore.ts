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
  currentUserId: string | null;

  // Actions
  addToWatchHistory: (movie: Movie, rating?: number) => void;
  updateRating: (movieId: string, rating: number) => void;
  removeFromWatchHistory: (movieId: string) => void;
  clearWatchHistory: () => void;
  getRecentHistory: (limit: number) => WatchHistoryItem[];
  setCurrentUser: (userId: string | null) => void;
  loadUserWatchHistory: (userId: string) => void;
}

export const useWatchHistoryStore = create<WatchHistoryState>()(
  devtools(
    persist(
      (set, get) => ({
        watchHistory: [],
        currentUserId: null,

        setCurrentUser: (userId: string | null) => {
          const { currentUserId } = get();

          // 사용자가 바뀌면 시청이력 초기화하고 새 사용자 데이터 로드
          if (currentUserId !== userId) {
            set({ currentUserId: userId, watchHistory: [] });

            if (userId) {
              get().loadUserWatchHistory(userId);
            }
          }
        },

        loadUserWatchHistory: (userId: string) => {
          // localStorage에서 해당 사용자의 시청이력 로드
          if (typeof window !== 'undefined') {
            try {
              const userWatchHistory = localStorage.getItem(`watch-history-${userId}`);
              if (userWatchHistory) {
                const parsedHistory = JSON.parse(userWatchHistory);
                // Date 객체 복원
                const historyWithDates = parsedHistory.map((item: WatchHistoryItem) => ({
                  ...item,
                  movieData: {
                    ...item.movieData,
                    release: new Date(item.movieData.release),
                    createdAt: new Date(item.movieData.createdAt),
                    updatedAt: new Date(item.movieData.updatedAt),
                  },
                }));
                set({ watchHistory: historyWithDates });
              }
            } catch (error) {
              console.warn('사용자 시청이력 로드 실패:', error);
            }
          }
        },

        addToWatchHistory: (movie: Movie, rating?: number) => {
          const { currentUserId } = get();

          if (!currentUserId) {
            console.warn('로그인된 사용자가 없습니다.');
            return;
          }
          const { watchHistory } = get();
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
            id: movie.id.toString(), // 확실히 string으로 변환

            title: movie.title,
            poster: movie.imgUrl,
            watchDate: currentDate,
            rating: rating,
            movieData: movie,
          };

          let newHistory;
          if (existingIndex !== -1) {
            // 기존 항목이 있으면 제거하고 맨 앞에 추가 (최신순 정렬)
            newHistory = [
              newItem,
              ...watchHistory.filter((_, index) => index !== existingIndex),
            ];
          } else {
            // 새로운 항목이면 맨 앞에 추가
            newHistory = [newItem, ...watchHistory];
          }

          set({ watchHistory: newHistory });

          // 사용자별 localStorage에 저장
          if (typeof window !== 'undefined') {
            localStorage.setItem(`watch-history-${currentUserId}`, JSON.stringify(newHistory));
          }
        },

        updateRating: (movieId: string, rating: number) => {
          const { currentUserId } = get();

          if (!currentUserId) {
            console.warn('로그인된 사용자가 없습니다.');
            return;
          }

          set((state) => {
            const newHistory = state.watchHistory.map((item) =>
              item.id === movieId ? { ...item, rating } : item
            );

            // 사용자별 localStorage에 저장
            if (typeof window !== 'undefined') {
              localStorage.setItem(`watch-history-${currentUserId}`, JSON.stringify(newHistory));
            }

            return { watchHistory: newHistory };
          });
        },

        removeFromWatchHistory: (movieId: string) => {
          const { currentUserId } = get();

          if (!currentUserId) {
            console.warn('로그인된 사용자가 없습니다.');
            return;
          }

          set((state) => {
            const newHistory = state.watchHistory.filter(
              (item) => item.id !== movieId
            );

            // 사용자별 localStorage에 저장
            if (typeof window !== 'undefined') {
              localStorage.setItem(`watch-history-${currentUserId}`, JSON.stringify(newHistory));
            }

            return { watchHistory: newHistory };
          });
        },

        clearWatchHistory: () => {
          const { currentUserId } = get();
          set({ watchHistory: [] });

          // 사용자별 localStorage에서도 삭제
          if (currentUserId && typeof window !== 'undefined') {
            localStorage.removeItem(`watch-history-${currentUserId}`);
          }
        },

        getRecentHistory: (limit: number) => {
          const { watchHistory } = get();
          return watchHistory.slice(0, limit);
        },
      }),
      {
        name: "watch-history-store-global", // 전역 상태만 저장 (currentUserId만)
        partialize: (state) => ({ currentUserId: state.currentUserId }), // watchHistory는 저장하지 않음
      }
    ),
    {
      name: "watch-history-store",
    }
  )
);
