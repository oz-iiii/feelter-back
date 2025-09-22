import { supabase, supabaseAdmin, type Database } from "../supabase";
import { Movie, MovieFilters, MovieRanking } from "../types/movie";

type MovieRow = Database["public"]["Tables"]["movies"]["Row"];
type MovieInsert = Database["public"]["Tables"]["movies"]["Insert"];
type RankingRow = Database["public"]["Tables"]["rankings"]["Row"];
type RankingInsert = Database["public"]["Tables"]["rankings"]["Insert"];

// Centralized error logger for Supabase responses
const logSupabaseError = (label: string, error: unknown) => {
  // Attempt to surface useful fields commonly present on Supabase errors
  const anyErr = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
    status?: number;
  } | null;

  const safeStringify = (value: unknown) => {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  console.error(label, {
    code: anyErr?.code,
    status: anyErr?.status,
    message: anyErr?.message,
    details: anyErr?.details,
    hint: anyErr?.hint,
  });
  console.error(`${label} (string):`, anyErr?.message ?? String(error));
  console.error(`${label} (json):`, safeStringify(error));
};

// Helper function to generate feelter data based on genre
const generateFeelterData = (
  genres: string[]
): {
  feelterTime: string[];
  feelterPurpose: string[];
  feelterOccasion: string[];
} => {
  const genreList = Array.isArray(genres) ? genres : [genres];
  const genreStr = genreList.join(" ").toLowerCase();

  // 시간대 결정
  let feelterTime: string[] = ["저녁"]; // 기본값
  if (
    genreStr.includes("공포") ||
    genreStr.includes("스릴러") ||
    genreStr.includes("horror") ||
    genreStr.includes("thriller")
  ) {
    feelterTime = ["밤"];
  } else if (
    genreStr.includes("가족") ||
    genreStr.includes("애니메이션") ||
    genreStr.includes("family") ||
    genreStr.includes("animation")
  ) {
    feelterTime = ["오후"];
  } else if (genreStr.includes("로맨스") || genreStr.includes("romance")) {
    feelterTime = ["저녁"];
  }

  // 목적 결정
  let feelterPurpose: string[] = ["휴식"]; // 기본값
  if (
    genreStr.includes("공포") ||
    genreStr.includes("스릴러") ||
    genreStr.includes("horror") ||
    genreStr.includes("thriller")
  ) {
    feelterPurpose = ["스릴"];
  } else if (
    genreStr.includes("로맨스") ||
    genreStr.includes("romance") ||
    genreStr.includes("드라마") ||
    genreStr.includes("drama")
  ) {
    feelterPurpose = ["감동"];
  } else if (
    genreStr.includes("액션") ||
    genreStr.includes("action") ||
    genreStr.includes("모험") ||
    genreStr.includes("adventure")
  ) {
    feelterPurpose = ["자극"];
  } else if (genreStr.includes("코미디") || genreStr.includes("comedy")) {
    feelterPurpose = ["유머"];
  } else if (
    genreStr.includes("다큐멘터리") ||
    genreStr.includes("documentary")
  ) {
    feelterPurpose = ["학습"];
  }

  // 상황 결정
  let feelterOccasion: string[] = ["혼자"]; // 기본값
  if (
    genreStr.includes("가족") ||
    genreStr.includes("애니메이션") ||
    genreStr.includes("family") ||
    genreStr.includes("animation")
  ) {
    feelterOccasion = ["가족"];
  } else if (genreStr.includes("로맨스") || genreStr.includes("romance")) {
    feelterOccasion = ["연인"];
  } else if (
    genreStr.includes("액션") ||
    genreStr.includes("action") ||
    genreStr.includes("코미디") ||
    genreStr.includes("comedy")
  ) {
    feelterOccasion = ["친구"];
  }

  return { feelterTime, feelterPurpose, feelterOccasion };
};

// Helper function to convert Supabase row to Movie type (updated for actual DB schema)
const convertRowToMovie = (row: MovieRow): Movie => {
  const r = row as unknown as Record<string, unknown>;

  const genres = (r["genres"] as string[]) ?? [];
  const feelterData = generateFeelterData(genres);

  return {
    id: String(r["id"])!,
    tmdbid: (r["tmdb_id"] as number) ?? 0,
    title: (r["title"] as string) ?? "",
    release: r["release_date"]
      ? new Date(r["release_date"] as string)
      : new Date(),
    age: (r["certification"] as string) ?? "전체관람가",
    genre: genres,
    runningTime: `${(r["runtime"] as number) || 120}분`,
    country: (r["countries"] as string[]) ?? "",
    director: (r["directors"] as string[]) ?? "",
    actor: (r["actors"] as string[]) ?? "",
    overview: (r["overview"] as string) ?? "",
    streaming: (r["streaming_providers"] as string[]) ?? ["Netflix"],
    streamingUrl: "", // Not in current schema
    youtubeUrl: (r["videos"] as string) ?? "",
    imgUrl: (r["poster_url"] as string) ?? "",
    bgUrl: (r["poster_url"] as string) ?? "", // Use poster as background for now
    feelterTime: feelterData.feelterTime,
    feelterPurpose: feelterData.feelterPurpose,
    feelterOccasion: feelterData.feelterOccasion,
    rating:
      (r["rating"] as number) ?? (r["user_rating"] as number) ?? undefined, // 네티즌 평점 매핑
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Helper function to convert Movie to Supabase insert type
const convertMovieToInsert = (
  movie: Omit<Movie, "id" | "createdAt" | "updatedAt">
): MovieInsert => ({
  tmdbid: movie.tmdbid,
  title: movie.title,
  release:
    typeof movie.release === "string"
      ? movie.release
      : movie.release.toISOString(),
  age: movie.age,
  genre: movie.genre,
  runningTime: movie.runningTime,
  country: movie.country,
  director: movie.director,
  actor: movie.actor,
  overview: movie.overview,
  streaming: movie.streaming,
  streamingUrl: movie.streamingUrl,
  youtubeUrl: movie.youtubeUrl,
  imgUrl: movie.imgUrl,
  bgUrl: movie.bgUrl,
  feelterTime: movie.feelterTime,
  feelterPurpose: movie.feelterPurpose,
  feelterOccasion: movie.feelterOccasion,
});

// 영화 관련 서비스
export const movieService = {
  // 모든 영화 가져오기
  async getAllMovies(): Promise<Movie[]> {
    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client.from("movie_with_rating").select("*");

    if (error) {
      logSupabaseError("영화 데이터 조회 오류:", error);
      throw new Error(`영화 데이터 조회 실패: ${error.message}`);
    }

    return data.map(convertRowToMovie);
  },

  // 영화 ID로 가져오기
  async getMovieById(id: string): Promise<Movie | null> {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // 데이터가 없음
      }
      console.error("영화 조회 오류:", error);
      throw new Error(`영화 조회 실패: ${error.message}`);
    }

    return convertRowToMovie(data);
  },

  // 필터링된 영화 가져오기
  async getFilteredMovies(
    filters: MovieFilters,
    pageSize: number = 20,
    page: number = 0
  ): Promise<{
    movies: Movie[];
    hasMore: boolean;
    total: number;
  }> {
    let query = supabase
      .from("movie_with_rating")
      .select("*", { count: "exact" });

    // 필터 적용
    if (filters.genre) {
      query = query.ilike("genre", `%${filters.genre}%`);
    }
    if (filters.streaming) {
      query = query.eq("streaming", filters.streaming);
    }
    if (filters.age) {
      query = query.eq("age", filters.age);
    }
    if (filters.country) {
      query = query.ilike("country", `%${filters.country}%`);
    }
    if (filters.feelterTime) {
      // Support both camelCase and snake_case columns
      query = query.or(
        `feelterTime.eq.${filters.feelterTime},feelter_time.eq.${filters.feelterTime}`
      );
    }
    if (filters.feelterPurpose) {
      query = query.or(
        `feelterPurpose.eq.${filters.feelterPurpose},feelter_purpose.eq.${filters.feelterPurpose}`
      );
    }
    if (filters.feelterOccasion) {
      query = query.or(
        `feelterOccasion.eq.${filters.feelterOccasion},feelter_occasion.eq.${filters.feelterOccasion}`
      );
    }

    // 정렬
    const sortColumn = filters.sortBy || "release";
    const sortOrder = filters.sortOrder || "desc";
    const dbSortColumn = sortColumn === "release" ? "release_date" : sortColumn;
    query = query.order(dbSortColumn, { ascending: sortOrder === "asc" });

    // 페이지네이션
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("필터링된 영화 조회 오류:", error);
      throw new Error(`필터링된 영화 조회 실패: ${error.message}`);
    }

    const movies = (data as MovieRow[]).map(convertRowToMovie);
    const total = count || 0;
    const hasMore = from + pageSize < total;

    return { movies, hasMore, total };
  },

  // 영화 추가
  async addMovie(
    movie: Omit<Movie, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const movieInsert = convertMovieToInsert(movie);

    const { data, error } = await supabase
      .from("movies")
      .insert(movieInsert)
      .select("id")
      .single();

    if (error) {
      console.error("영화 추가 오류:", error);
      throw new Error(`영화 추가 실패: ${error.message}`);
    }

    return data.id;
  },

  // 영화 업데이트
  async updateMovie(id: string, updates: Partial<Movie>): Promise<void> {
    const updateData: Record<string, unknown> = { ...updates };

    // Date 객체를 ISO 문자열로 변환
    if (updateData.release && updateData.release instanceof Date) {
      updateData.release = updateData.release.toISOString();
    }

    // ID, createdAt, updatedAt 제거
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const { error } = await supabase
      .from("movies")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("영화 업데이트 오류:", error);
      throw new Error(`영화 업데이트 실패: ${error.message}`);
    }
  },

  // 영화 삭제
  async deleteMovie(id: string): Promise<void> {
    const { error } = await supabase.from("movies").delete().eq("id", id);

    if (error) {
      console.error("영화 삭제 오류:", error);
      throw new Error(`영화 삭제 실패: ${error.message}`);
    }
  },

  // 배치로 영화 추가 (초기 데이터 입력용)
  async addMoviesBatch(
    movies: Omit<Movie, "id" | "createdAt" | "updatedAt">[]
  ): Promise<void> {
    console.log(`Supabase에 ${movies.length}개 영화 배치 추가 시작...`);

    const movieInserts: MovieInsert[] = movies.map(convertMovieToInsert);

    const { data, error } = await supabase
      .from("movies")
      .insert(movieInserts)
      .select("id");

    if (error) {
      console.error("영화 배치 추가 오류:", error);
      throw new Error(`영화 배치 추가 실패: ${error.message}`);
    }

    console.log(`✅ ${data?.length || 0}개 영화가 성공적으로 추가되었습니다.`);
  },
};

// 영화 순위 관련 서비스
export const movieRankingService = {
  // 모든 순위 가져오기
  async getAllRankings(): Promise<MovieRanking[]> {
    const { data, error } = await supabase
      .from("rankings")
      .select(
        `
        *,
        movies (*)
      `
      )
      .order("rank", { ascending: true });

    if (error) {
      console.error("순위 데이터 조회 오류:", error);
      throw new Error(`순위 데이터 조회 실패: ${error.message}`);
    }

    return (data as (RankingRow & { movies: MovieRow })[]).map((row) => ({
      id: row.id,
      rank: row.rank,
      movieId: row.movieId,
      movie: convertRowToMovie(row.movies),
      bestComment: row.bestComment,
      createdAt: new Date(row.createdAt),
    }));
  },

  // 순위 추가
  async addRanking(
    ranking: Omit<MovieRanking, "id" | "createdAt" | "movie">
  ): Promise<string> {
    const { data, error } = await supabase
      .from("rankings")
      .insert({
        rank: ranking.rank,
        movieId: ranking.movieId,
        bestComment: ranking.bestComment,
      } as RankingInsert)
      .select("id")
      .single();

    if (error) {
      console.error("순위 추가 오류:", error);
      throw new Error(`순위 추가 실패: ${error.message}`);
    }

    return data.id;
  },

  // 배치로 순위 추가
  async addRankingsBatch(
    rankings: Omit<MovieRanking, "id" | "createdAt" | "movie">[]
  ): Promise<void> {
    console.log(`Supabase에 ${rankings.length}개 순위 배치 추가 시작...`);

    const rankingInserts: RankingInsert[] = rankings.map((ranking) => ({
      rank: ranking.rank,
      movieId: ranking.movieId,
      bestComment: ranking.bestComment,
    }));

    const { data, error } = await supabase
      .from("rankings")
      .insert(rankingInserts)
      .select("id");

    if (error) {
      console.error("순위 배치 추가 오류:", error);
      throw new Error(`순위 배치 추가 실패: ${error.message}`);
    }

    console.log(`✅ ${data?.length || 0}개 순위가 성공적으로 추가되었습니다.`);
  },
};
