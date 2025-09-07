import { supabase } from "../lib/supabase";
import {
	movieService,
	movieRankingService,
} from "../lib/services/movieService";
import { Movie } from "../lib/types/movie";

// JSON 파일에서 크롤링된 데이터 직접 임포트
import crawledData from "../crawled-upcoming-movies-2025-09-03T12-38-29-648Z.json";

// 크롤링된 데이터의 타입 정의 (실제 JSON 구조에 맞게 수정)
interface CrawledMovie {
	tmdbId: number;
	title: string;
	releaseDate: string;
	certification: string;
	genres: string[];
	runtime: number;
	countries: string[];
	directors: string[];
	cast: string[];
	overview: string;
	streamingProviders: string[];
	posterUrl: string;
}

// 크롤링된 데이터를 현재 테이블 구조에 맞게 변환 (모든 필수 컬럼 포함)
const mockMovies = crawledData.map((movie: CrawledMovie) => ({
	tmdbid: movie.tmdbId,
	title: movie.title,
	release: new Date(movie.releaseDate).toISOString(),
	age: movie.certification || "전체",
	genre: movie.genres.join(", ") || "일반",
	runningtime: movie.runtime ? `${movie.runtime}분` : "120분",
	country: movie.countries.join(", ") || "미국",
	director: movie.directors.join(", ") || "미상",
	actor: movie.cast.slice(0, 5).join(", ") || "미상",
	overview: movie.overview || "줄거리 정보 없음",
	// 추가 필수 컬럼들
	streaming: movie.streamingProviders.length > 0 ? movie.streamingProviders[0] : "Netflix",
	streamingurl: "https://netflix.com",
	youtubeurl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // 기본값 사용
	imgurl: movie.posterUrl || "https://via.placeholder.com/500x750",
	bgurl: movie.posterUrl || "https://via.placeholder.com/1920x1080",
	feeltertime: "저녁",
	feelterpurpose: movie.genres.includes("공포") ? "스릴" : movie.genres.includes("로맨스") ? "감동" : "휴식",
	feelteroccasion: movie.genres.includes("가족") ? "가족" : movie.genres.includes("로맨스") ? "연인" : "혼자"
}));

// 영화 데이터를 Supabase에 입력하는 함수
async function seedMovies() {
	try {
		console.log("영화 데이터를 Supabase에 입력하는 중...");
		console.log(`변환된 영화 데이터 수: ${mockMovies.length}개`);

		// 첫 번째 데이터 확인
		if (mockMovies.length > 0) {
			console.log(
				"첫 번째 영화 데이터:",
				JSON.stringify(mockMovies[0], null, 2)
			);
		}

		// 기존 데이터 삭제 (선택사항)
		// const existingMovies = await movieService.getAllMovies();
		// for (const movie of existingMovies) {
		//   await movieService.deleteMovie(movie.id);
		// }

		// 하나씩 추가해서 어떤 데이터가 문제인지 확인
		for (let i = 0; i < mockMovies.length; i++) {
			console.log(`\n=== ${i + 1}번째 영화 처리 시작 ===`);
			console.log(`영화 제목: ${mockMovies[i].title}`);
			console.log(`TMDB ID: ${mockMovies[i].tmdbid}`);

			try {
				console.log(`Supabase에 ${mockMovies[i].title} 추가 시도 중...`);
				
				// movieService 대신 직접 Supabase API 호출
				const { error } = await supabase
					.from('movies')
					.insert(mockMovies[i])
					.select();
					
				if (error) {
					throw new Error(`Supabase 삽입 실패: ${error.message}`);
				}
				
				console.log(`✅ ${mockMovies[i].title} 성공적으로 추가됨`);
			} catch (error) {
				console.error(`❌ ${mockMovies[i].title} 추가 실패:`, error);
				console.error(`에러 세부사항:`, JSON.stringify(error, null, 2));

				// 에러가 발생해도 계속 진행
				console.log(`${mockMovies[i].title} 실패했지만 다음 영화 계속 진행...`);
			}

			console.log(`=== ${i + 1}번째 영화 처리 완료 ===\n`);

			// 각 영화 처리 후 잠시 대기
			if (i < mockMovies.length - 1) {
				console.log("다음 영화 처리 전 1초 대기...");
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		console.log("✅ 영화 데이터 입력 완료!");

		// 입력된 영화 목록 확인
		const movies = await movieService.getAllMovies();
		console.log(`총 ${movies.length}개의 영화가 입력되었습니다.`);

		// 영화 순위 데이터도 추가 (선택사항)
		const rankings = movies.slice(0, 10).map((movie, index) => ({
			rank: index + 1,
			movieId: movie.id,
			bestComment: `${movie.title} 정말 재미있어요!`,
		}));

		await movieRankingService.addRankingsBatch(rankings);
		console.log("✅ 영화 순위 데이터 입력 완료!");
	} catch (error) {
		console.error("❌ 영화 데이터 입력 중 오류 발생:", error);
	}
}

// 스크립트 실행
if (require.main === module) {
	seedMovies();
}

export { seedMovies };
