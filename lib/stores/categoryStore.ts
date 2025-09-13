import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Movie } from "../types/movie";

export interface UserCategory {
  id: string;
  name: string;
  description?: string;
  movies: Movie[];
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryState {
  categories: UserCategory[];

  // Actions
  createCategory: (name: string, description?: string) => string;
  updateCategory: (id: string, updates: Partial<UserCategory>) => void;
  deleteCategory: (id: string) => void;
  addMoviesToCategory: (categoryId: string, movies: Movie[]) => void;
  removeMovieFromCategory: (categoryId: string, movieId: number) => void;
  getCategoryById: (id: string) => UserCategory | undefined;
  // 디버깅용 함수
  testAddMovie: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    persist(
      (set, get) => ({
        categories: [],

        createCategory: (name: string, description?: string) => {
          const newCategory: UserCategory = {
            id: `category_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            name,
            description,
            movies: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            categories: [...state.categories, newCategory],
          }));

          return newCategory.id;
        },

        updateCategory: (id: string, updates: Partial<UserCategory>) => {
          set((state) => ({
            categories: state.categories.map((category) =>
              category.id === id
                ? { ...category, ...updates, updatedAt: new Date() }
                : category
            ),
          }));
        },

        deleteCategory: (id: string) => {
          set((state) => ({
            categories: state.categories.filter(
              (category) => category.id !== id
            ),
          }));
        },

        addMoviesToCategory: (categoryId: string, movies: Movie[]) => {
          console.log("Adding movies to category:", {
            categoryId,
            movies: movies.length,
          });
          set((state) => {
            const updatedCategories = state.categories.map((category) =>
              category.id === categoryId
                ? {
                    ...category,
                    movies: [
                      ...category.movies.filter(
                        (existingMovie) =>
                          !movies.some(
                            (newMovie) => newMovie.id === existingMovie.id
                          )
                      ),
                      ...movies,
                    ],
                    updatedAt: new Date(),
                  }
                : category
            );
            console.log("Updated categories:", updatedCategories);
            return { categories: updatedCategories };
          });
        },

        removeMovieFromCategory: (categoryId: string, movieId: number) => {
          set((state) => ({
            categories: state.categories.map((category) =>
              category.id === categoryId
                ? {
                    ...category,
                    movies: category.movies.filter(
                      (Movie) => Movie.id !== movieId
                    ),
                    updatedAt: new Date(),
                  }
                : category
            ),
          }));
        },

        getCategoryById: (id: string) => {
          const { categories } = get();
          return categories.find((category) => category.id === id);
        },

        // 디버깅용 테스트 함수
        testAddMovie: () => {
          const testCategory = get().createCategory(
            "테스트 카테고리",
            "테스트용입니다"
          );
          const testMovie: Movie = {
            id: 1,
            tmdbid: 123,
            title: "테스트 영화",
            release: new Date(),
            age: "12세관람가",
            genre: ["액션"],
            runningTime: "120분",
            country: ["한국"],
            director: ["홍길동"],
            actor: ["김영희"],
            overview: "테스트 영화입니다",
            streaming: ["넷플릭스"],
            streamingUrl: "https://netflix.com",
            youtubeUrl: "https://youtube.com",
            imgUrl: "/test-image.jpg",
            bgUrl: "/test-bg.jpg",
            feelterTime: ["저녁"],
            feelterPurpose: ["휴식"],
            feelterOccasion: ["혼자"],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          get().addMoviesToCategory(testCategory, [testMovie]);
          console.log("테스트 영화가 추가되었습니다:", get().categories);
        },
      }),
      {
        name: "category-store",
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const data = JSON.parse(str);
            // Date 객체 복원
            if (data.state?.categories) {
              data.state.categories = data.state.categories.map((cat: UserCategory) => ({
                ...cat,
                createdAt: new Date(cat.createdAt),
                updatedAt: new Date(cat.updatedAt),
                movies:
                  cat.movies?.map((movie: Movie) => ({
                    ...movie,
                    release: new Date(movie.release),
                    createdAt: new Date(movie.createdAt),
                    updatedAt: new Date(movie.updatedAt),
                  })) || [],
              }));
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
      name: "category-store",
    }
  )
);
