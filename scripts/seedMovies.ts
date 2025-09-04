import {
	movieService,
	movieRankingService,
} from "../lib/services/movieService";
import { Movie } from "../lib/types/movie";

// JSON 파일에서 크롤링된 데이터 직접 임포트
import crawledData from "../crawled-upcoming-movies-2025-09-03T12-38-29-648Z.json";

// 크롤링된 데이터의 타입 정의
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
	videos: {
		trailers: string[];
		teasers: string[];
		clips: string[];
		other: string[];
	};
}

// 크롤링된 데이터를 lib/types/Movie 형식으로 변환
const mockMovies: Omit<Movie, "id" | "createdAt" | "updatedAt">[] =
	crawledData.map((movie: CrawledMovie) => ({
		tmdbid: movie.tmdbId,
		title: movie.title,
		// [수정] releaseDate 문자열을 Date 객체로 변환
		release: new Date(movie.releaseDate),
		age: movie.certification,
		genre: movie.genres.join(", "),
		// [수정] runningTime을 숫자(number) 타입 그대로 사용
		runningTime: String(movie.runtime),
		country: movie.countries.join(", "),
		director: movie.directors.join(", "),
		actor: movie.cast.slice(0, 5).join(", "),
		overview: movie.overview,
		streaming:
			movie.streamingProviders.length > 0
				? movie.streamingProviders[0]
				: "Netflix",
		streamingUrl: "https://netflix.com",
		youtubeUrl:
			movie.videos.trailers.length > 0
				? movie.videos.trailers[0]
				: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		imgUrl: movie.posterUrl,
		bgUrl: movie.posterUrl,
		feelterTime: "저녁",
		feelterPurpose: movie.genres.includes("공포")
			? "스릴"
			: movie.genres.includes("로맨스")
			? "감동"
			: "휴식",
		feelterOccasion: movie.genres.includes("가족")
			? "가족"
			: movie.genres.includes("로맨스")
			? "연인"
			: "혼자",
	}));

// 영화 데이터를 Firebase에 입력하는 함수
async function seedMovies() {
	try {
		console.log("영화 데이터를 Firebase에 입력하는 중...");
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
				console.log(`Firebase에 ${mockMovies[i].title} 추가 시도 중...`);
				await movieService.addMoviesBatch([mockMovies[i]]);
				console.log(`✅ ${mockMovies[i].title} 성공적으로 추가됨`);
			} catch (error) {
				console.error(`❌ ${mockMovies[i].title} 추가 실패:`, error);
				console.error(`에러 세부사항:`, JSON.stringify(error, null, 2));

				// 에러가 발생해도 계속 진행
				console.log(`${mockMovies[i].title} 실패했지만 다음 영화 계속 진행...`);
			}

			console.log(`=== ${i + 1}번째 영화 처리 완료 ===\n`);

			// 각 영화 처리 후 잠시 대기 (Firebase 제한 방지)
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
