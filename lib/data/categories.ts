import { Category } from '@/components/common/model/types';

export const defaultCategories: Category[] = [
  {
    id: 1,
    name: "액션 명작",
    description: "스릴 넘치는 액션 영화들",
    movieCount: 3,
    isPublic: true,
    createdDate: "2025.01.15",
    movies: []
  },
  {
    id: 2,
    name: "로맨틱 코미디",
    description: "달콤한 로맨틱 코미디 컬렉션",
    movieCount: 2,
    isPublic: false,
    createdDate: "2025.01.10",
    movies: []
  }
];