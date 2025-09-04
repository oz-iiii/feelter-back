// 키 시스템이 타입 변경에 자동으로 적응하는 예시

import { MOVIE_KEYS, type MovieKey } from "./keys";
import type { Movie } from "../components/common/model/types";

// 사용 예시
console.log("현재 Movie 키들:");
console.log("ID 키:", MOVIE_KEYS.id); // 'id'
console.log("제목 키:", MOVIE_KEYS.title); // 'title' 

// 만약 Movie 타입에 새로운 필드가 추가되면:
// interface Movie {
//   id: number;
//   title: string;
//   tmdbId?: number;  // 새로운 필드
//   ...
// }

// MOVIE_KEYS.tmdbId 도 자동으로 사용 가능하게 됨 (타입 체크에서)
// console.log("TMDB ID 키:", MOVIE_KEYS.tmdbId); // 'tmdbId'

// 타입 안전한 객체 생성 예시
const createMovie = (data: Partial<Movie>): Partial<Movie> => {
  return {
    [MOVIE_KEYS.id]: data.id,
    [MOVIE_KEYS.title]: data.title,
    [MOVIE_KEYS.genre]: data.genre,
    // 타입에 새 필드가 추가되면 여기서도 자동완성으로 사용 가능
  };
};

// 동적 키 접근 예시
function getMovieValue<K extends MovieKey>(movie: Movie, key: K): Movie[K] {
  return movie[key];
}

// 사용법
const exampleMovie: Movie = {
  id: 1,
  title: "테스트 영화",
  poster: "/poster.jpg",
  genre: "SF",
  director: "감독",
  rating: 4.5,
};

const title = getMovieValue(exampleMovie, MOVIE_KEYS.title);
const rating = getMovieValue(exampleMovie, MOVIE_KEYS.rating);

console.log(`${title}: ${rating}점`);

export { createMovie, getMovieValue };