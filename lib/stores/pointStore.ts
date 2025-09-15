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
  currentPoints: number;
  pointHistory: PointHistoryItem[];

  // Actions
  addPoints: (amount: number, description: string, movieTitle?: string) => void;
  usePoints: (amount: number, description: string, movieTitle?: string) => void;
  updatePoints: (newPoints: number) => void;
  clearHistory: () => void;
  getTotalEarned: () => number;
  getTotalUsed: () => number;
  getFilteredHistory: (filter: string) => PointHistoryItem[];
}

export const usePointStore = create<PointState>()(
  devtools(
    persist(
      (set, get) => ({
        currentPoints: 2450,
        pointHistory: [
          {
            id: 1,
            type: "earn",
            amount: 100,
            description: "영화 리뷰 작성",
            date: "2024.08.10",
            movieTitle: "인터스텔라",
          },
          {
            id: 2,
            type: "earn",
            amount: 50,
            description: "영화 평점 등록",
            date: "2024.08.08",
            movieTitle: "기생충",
          },
          {
            id: 3,
            type: "use",
            amount: -200,
            description: "프리미엄 영화 대여",
            date: "2024.08.07",
            movieTitle: "타이타닉",
          },
          {
            id: 4,
            type: "earn",
            amount: 300,
            description: "설문조사 참여",
            date: "2024.08.05",
            movieTitle: null,
          },
          {
            id: 5,
            type: "use",
            amount: -150,
            description: "할인 쿠폰",
            date: "2024.08.03",
            movieTitle: null,
          },
          {
            id: 6,
            type: "earn",
            amount: 250,
            description: "추천 영화 등록",
            date: "2024.08.01",
            movieTitle: "라라랜드",
          },
        ],

        addPoints: (amount: number, description: string, movieTitle?: string) => {
          const { pointHistory, currentPoints } = get();
          const currentDate = new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).replace(/\s/g, '').replace(/\./g, '.');

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

        usePoints: (amount: number, description: string, movieTitle?: string) => {
          const { pointHistory, currentPoints } = get();

          if (currentPoints < amount) {
            throw new Error("포인트가 부족합니다.");
          }

          const currentDate = new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).replace(/\s/g, '').replace(/\./g, '.');

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
          if (filter === "earn") return pointHistory.filter((item) => item.type === "earn");
          if (filter === "use") return pointHistory.filter((item) => item.type === "use");
          return pointHistory;
        },
      }),
      {
        name: "point-store", // localStorage key
      }
    ),
    {
      name: "point-store",
    }
  )
);