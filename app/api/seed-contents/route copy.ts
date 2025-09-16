import { NextResponse } from "next/server";
import { movieService } from "@/lib/services/movieService";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { Movie } from "@/lib/types/movie";

// JSON 파일에서 크롤링된 데이터 직접 임포트
import crawledData from "./contents.json";

// 크롤링된 데이터의 타입 정의
interface CrawledMovie {
  contentsid: number;
  title: string;
  release: Date;
  age: string;
  genres: string;
  runningtime: string;
  countries: string;
  directors: string;
  actors: string[];
  overview: string;
  netizenRaing: number;
  imgUrl: string;
  bgUrl: string;
  youtubeUrl: string;
  ottplatform: string;
  netflixUrl?: string;
  tvingUrl?: string;
  coupangplayUrl?: string;
  wavveUrl?: string;
  disneyUrl?: string;
  watchaUrl?: string;
  feelterTime: string;
  feelterPurpose: string;
  feelterOccasion: string;
  bestcoment: string;
  upload: Date;
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
    genre: movie.genres, // string[] 그대로 사용
    runningTime: `${movie.runtime}분`,
    country: movie.countries, // string[] 그대로 사용
    director: movie.directors, // string[] 그대로 사용
    actor: movie.cast.slice(0, 5), // string[] 그대로 사용
    overview: movie.overview,
    streaming:
      movie.streamingProviders.length > 0
        ? movie.streamingProviders
        : ["Netflix"], // string[] 배열로 변경
    streamingUrl: "https://netflix.com",
    youtubeUrl:
      movie.videos?.trailers?.length && movie.videos.trailers.length > 0
        ? movie.videos.trailers[0]
        : "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    imgUrl: movie.posterUrl,
    bgUrl: movie.posterUrl,
    feelterTime: ["저녁"], // string[] 배열로 변경
    feelterPurpose: movie.genres.includes("공포")
      ? ["스릴"]
      : movie.genres.includes("로맨스")
      ? ["감동"]
      : ["휴식"], // string[] 배열로 변경
    feelterOccasion: movie.genres.includes("가족")
      ? ["가족"]
      : movie.genres.includes("로맨스")
      ? ["연인"]
      : ["혼자"], // string[] 배열로 변경
  })
);

export async function POST() {
  try {
    console.log("영화 데이터를 Supabase에 입력하는 중...");

    // 스키마에 맞춘 정확 매핑 (snake_case) + admin 클라이언트 사용
    const inserts = mockMovies.map((m) => ({
      tmdb_id: m.tmdbid,
      title: m.title,
      release_date:
        typeof m.release === "string"
          ? m.release
          : m.release.toISOString().slice(0, 10),
      certification: m.age,
      genres: Array.isArray(m.genre) ? m.genre : [],
      runtime: parseInt((m.runningTime || "0").replace(/[^0-9]/g, ""), 10) || 0,
      countries: Array.isArray(m.country) ? m.country : [],
      directors: Array.isArray(m.director) ? m.director : [],
      actors: Array.isArray(m.actor) ? m.actor : [],
      overview: m.overview,
      streaming_providers: Array.isArray(m.streaming) ? m.streaming : [],
      poster_url: m.imgUrl || m.bgUrl,
    }));

    const client = supabaseAdmin ?? supabase;
    const { error: insertError } = await client.from("movies").insert(inserts);

    if (insertError) {
      console.error("시드 삽입 오류:", insertError);
      throw new Error(`영화 배치 추가 실패: ${insertError.message}`);
    }

    console.log("✅ 영화 데이터 입력 완료!");

    // 입력된 영화 목록 확인
    const movies = await movieService.getAllMovies();
    console.log(`총 ${movies.length}개의 영화가 입력되었습니다.`);

    // rankings 테이블은 현재 스키마에 없으므로 건너뜀

    return NextResponse.json({
      success: true,
      message: "영화 데이터가 성공적으로 입력되었습니다.",
      moviesCount: movies.length,
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
