import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface PointHistoryItem {
  id: number;
  type: "earn" | "use";
  amount: number;
  description: string;
  date: string;
  movieTitle?: string | null;
}

interface PointState {
  version: number;
  currentPoints: number;
  pointHistory: PointHistoryItem[];

  // Actions
  addPoints: (amount: number, description: string, movieTitle?: string) => void;
  usePoints: (amount: number, description: string, movieTitle?: string) => void;
  updatePoints: (newPoints: number) => void;
  clearHistory: () => void;
  resetToDefault: () => void;
  initializeNewUser: () => void;
  getTotalEarned: () => number;
  getTotalUsed: () => number;
  getFilteredHistory: (filter: string) => PointHistoryItem[];
}

// 신규 사용자 환영 보너스
const welcomeBonus: PointHistoryItem = {
  id: 1,
  type: "earn",
  amount: 100,
  description: "회원가입 환영 보너스",
  date: new Date()
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\s/g, "")
    .replace(/\./g, "."),
  movieTitle: null,
};

export const usePointStore = create<PointState>()(
  devtools(
    persist(
      (set, get) => ({
        version: 1,
        currentPoints: 100,
        pointHistory: [welcomeBonus],

        addPoints: (
          amount: number,
          description: string,
          movieTitle?: string
        ) => {
          const { pointHistory, currentPoints } = get();
          const currentDate = new Date()
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\s/g, "")
            .replace(/\./g, ".");

          const newHistoryItem: PointHistoryItem = {
            id: Date.now(),
            type: "earn",
            amount: amount,
            description: description,
            date: currentDate,
            movieTitle: movieTitle || null,
          };

          set({
            currentPoints: currentPoints + amount,
            pointHistory: [newHistoryItem, ...pointHistory],
          });
        },

        usePoints: (
          amount: number,
          description: string,
          movieTitle?: string
        ) => {
          const { pointHistory, currentPoints } = get();

          if (currentPoints < amount) {
            throw new Error("포인트가 부족합니다.");
          }

          const currentDate = new Date()
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\s/g, "")
            .replace(/\./g, ".");

          const newHistoryItem: PointHistoryItem = {
            id: Date.now(),
            type: "use",
            amount: -amount,
            description: description,
            date: currentDate,
            movieTitle: movieTitle || null,
          };

          set({
            currentPoints: currentPoints - amount,
            pointHistory: [newHistoryItem, ...pointHistory],
          });
        },

        updatePoints: (newPoints: number) => {
          set({ currentPoints: newPoints });
        },

        clearHistory: () => {
          set({ pointHistory: [] });
        },

        resetToDefault: () => {
          set({
            version: 1,
            currentPoints: 100,
            pointHistory: [welcomeBonus],
          });
        },

        initializeNewUser: () => {
          set({
            version: 1,
            currentPoints: 100,
            pointHistory: [welcomeBonus],
          });
        },

        getTotalEarned: () => {
          const { pointHistory } = get();
          return pointHistory
            .filter((item) => item.type === "earn")
            .reduce((sum, item) => sum + item.amount, 0);
        },

        getTotalUsed: () => {
          const { pointHistory } = get();
          return pointHistory
            .filter((item) => item.type === "use")
            .reduce((sum, item) => sum + Math.abs(item.amount), 0);
        },

        getFilteredHistory: (filter: string) => {
          const { pointHistory } = get();
          if (filter === "all") return pointHistory;
          if (filter === "earn")
            return pointHistory.filter((item) => item.type === "earn");
          if (filter === "use")
            return pointHistory.filter((item) => item.type === "use");
          return pointHistory;
        },
      }),
      {
        name: "point-store", // localStorage key
        version: 1,
        migrate: (persistedState: unknown, version: number) => {
          if (version < 1) {
            // 기존 데이터를 새로운 형태로 마이그레이션
            return {
              version: 1,
              currentPoints: 100,
              pointHistory: [welcomeBonus],
            };
          }
          return persistedState;
        },
      }
    ),
    {
      name: "point-store",
    }
  )
);
