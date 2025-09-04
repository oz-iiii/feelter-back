import { NextResponse } from "next/server";
import { movieService, movieRankingService } from "@/lib/services/movieService";
import { Movie } from "@/lib/types/movie";

// JSON 파일에서 크롤링된 데이터 직접 임포트
import crawledData from "../../../crawled-upcoming-movies-2025-09-03T12-38-29-648Z.json";

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

// JSON 추론 타입 보정
const crawled: CrawledMovie[] = crawledData as unknown as CrawledMovie[];

// 크롤링된 데이터를 lib/types/Movie 형식으로 변환
const mockMovies: Omit<Movie, "id" | "createdAt" | "updatedAt">[] = crawled.map(
	(movie: CrawledMovie) => ({
		tmdbid: movie.tmdbId,
		title: movie.title,
		release: new Date(movie.releaseDate),
		age: movie.certification,
		genre: movie.genres.join(", "),
		runningTime: `${movie.runtime}분`,
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
	})
);

export async function POST() {
	try {
		console.log("영화 데이터를 Firebase에 입력하는 중...");

		// 배치로 영화 데이터 추가
		await movieService.addMoviesBatch(mockMovies);

		console.log("✅ 영화 데이터 입력 완료!");

		// 입력된 영화 목록 확인
		const movies = await movieService.getAllMovies();
		console.log(`총 ${movies.length}개의 영화가 입력되었습니다.`);

		// 영화 순위 데이터도 추가
		const rankings = movies.slice(0, 10).map((movie, index) => ({
			rank: index + 1,
			movieId: movie.id,
			bestComment: `${movie.title} 정말 재미있어요!`,
		}));

		await movieRankingService.addRankingsBatch(rankings);
		console.log("✅ 영화 순위 데이터 입력 완료!");

		return NextResponse.json({
			success: true,
			message: "영화 데이터가 성공적으로 입력되었습니다.",
			moviesCount: movies.length,
			rankingsCount: rankings.length,
		});
	} catch (error) {
		console.error("❌ 영화 데이터 입력 중 오류 발생:", error);
		return NextResponse.json(
			{
				success: false,
				message: "영화 데이터 입력 중 오류가 발생했습니다.",
				error: error instanceof Error ? error.message : "알 수 없는 오류",
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		const movies = await movieService.getAllMovies();
		return NextResponse.json({
			success: true,
			moviesCount: movies.length,
			movies: movies.slice(0, 5), // 처음 5개만 반환
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: "영화 데이터를 불러오는 중 오류가 발생했습니다.",
				error: error instanceof Error ? error.message : "알 수 없는 오류",
			},
			{ status: 500 }
		);
	}
}
