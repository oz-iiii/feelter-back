import { supabase } from "../lib/supabase";
import crawledData from "../crawled-upcoming-movies-2025-09-03T12-38-29-648Z.json";

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

async function finalFixSeed() {
	console.log("🎯 최종 수정: runningtime 포함한 완전한 데이터로 삽입...");

	// runningtime을 포함한 완전한 데이터
	const completeMovies = (crawledData as CrawledMovie[]).map((movie) => ({
		tmdbid: movie.tmdbId,
		title: movie.title,
		release: movie.releaseDate ? new Date(movie.releaseDate).toISOString() : "",
		age:
			movie.certification && movie.certification.trim() !== ""
				? movie.certification
				: "전체",
		genre:
			Array.isArray(movie.genres) && movie.genres.length > 0
				? movie.genres.join(", ")
				: "일반",
		runningtime:
			typeof movie.runtime === "number" && movie.runtime > 0
				? `${movie.runtime}분`
				: "120분",
		country:
			Array.isArray(movie.countries) && movie.countries.length > 0
				? movie.countries.join(", ")
				: "미국",
		director:
			Array.isArray(movie.directors) && movie.directors.length > 0
				? movie.directors.join(", ")
				: "미상",
		actor:
			Array.isArray(movie.cast) && movie.cast.length > 0
				? movie.cast.slice(0, 5).join(", ")
				: "미상",
		overview:
			movie.overview && movie.overview.trim() !== ""
				? movie.overview
				: "줄거리 정보 없음",
	}));

	console.log("📊 완전한 데이터 샘플:");
	if (completeMovies.length > 0) {
		console.log(JSON.stringify(completeMovies[0], null, 2));
	} else {
		console.log("No movies found in crawledData.");
	}
	let successCount = 0;
	console.log(`🚀 총 ${completeMovies.length}개 영화 삽입 시작...`);

	for (let i = 0; i < completeMovies.length; i++) {
		console.log(
			`\n🎬 ${i + 1}/${completeMovies.length}: ${completeMovies[i].title}`
		);

		try {
			const { error } = await supabase
				.from("movies")
				.insert(completeMovies[i])
				.select();

			if (error) {
				console.error(`❌ 실패: ${error.message}`);

				if (error.message.includes("Could not find")) {
					const missingColumn = error.message.match(/'([^']+)' column/)?.[1];
					console.log(`💡 누락된 컬럼: ${missingColumn}`);
				}
			} else {
				successCount++;
				console.log(`✅ 성공! (${successCount}/${completeMovies.length})`);
			}
		} catch (exception) {
			console.error("❌ 예외:", exception);
		}

		// 진행 상황 표시 및 잠시 대기
		if (i % 1 === 0) {
			// 매 영화마다
			console.log(
				`📊 진행률: ${(((i + 1) / completeMovies.length) * 100).toFixed(1)}%`
			);
		}

		if (i < completeMovies.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기
		}
	}

	// 최종 결과
	console.log(
		`\n🎉 최종 결과: ${successCount}/${completeMovies.length}개 성공!`
	);

	if (successCount > 0) {
		// 현재 저장된 데이터 개수 확인
		const { count } = await supabase
			.from("movies")
			.select("*", { count: "exact", head: true });
		console.log(`📈 현재 테이블에 총 ${count}개 영화 저장됨`);
		console.log("🎊 축하합니다! Supabase Dashboard에서 확인해보세요!");
	} else {
		console.log(
			"💡 모든 삽입 실패. runningtime 컬럼의 NOT NULL 제약조건을 제거해보세요:"
		);
		console.log(
			"   ALTER TABLE movies ALTER COLUMN runningtime DROP NOT NULL;"
		);
	}
}

if (require.main === module) {
	finalFixSeed();
}
