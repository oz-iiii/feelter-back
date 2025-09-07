import { Movie } from '@/components/common/model/types';

export const movies: Movie[] = [
  {
    id: 1,
    title: "인터스텔라",
    director: "크리스토퍼 놀란",
    year: 2014,
    genre: "SF, 드라마",
    duration: "169분",
    rating: 4.5,
    poster: "/images/interstellar.jpg",
    addedDate: "2025.01.15",
    watchDate: "2025.01.10"
  },
  {
    id: 2,
    title: "라라랜드",
    director: "데미안 셔젤",
    year: 2016,
    genre: "로맨스, 뮤지컬",
    duration: "128분",
    rating: 4.2,
    poster: "/images/lalaland.jpg",
    addedDate: "2025.01.12",
    watchDate: "2025.01.08"
  },
  {
    id: 3,
    title: "기생충",
    director: "봉준호",
    year: 2019,
    genre: "드라마, 스릴러",
    duration: "132분",
    rating: 4.8,
    poster: "/images/parasite.jpg",
    addedDate: "2025.01.10",
    watchDate: "2025.01.05"
  }
];