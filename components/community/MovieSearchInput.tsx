"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Movie } from "@/lib/types/movie";

interface MovieSearchInputProps {
  onChange: (movieTitle: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function MovieSearchInput({
  onChange,
  placeholder = "영화 또는 드라마 제목을 입력하세요",
  required = false,
}: MovieSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock 영화 데이터 (데이터베이스에 데이터가 없을 때 사용)
  const mockMovies: Movie[] = [
    {
      id: "1",
      tmdbid: 550,
      title: "어벤져스",
      release: new Date("2012-05-04"),
      age: "12세 이상",
      genre: ["액션", "SF", "모험"],
      runningTime: "143분",
      country: ["미국"],
      director: ["조스 휘던"],
      actor: ["로버트 다우니 주니어", "크리스 에반스", "마크 러팔로"],
      overview: "지구의 운명을 건 최강의 히어로들의 대결",
      streaming: ["Disney+"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
      bgUrl: "",
      feelterTime: ["저녁"],
      feelterPurpose: ["자극"],
      feelterOccasion: ["친구"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      tmdbid: 155,
      title: "다크 나이트",
      release: new Date("2008-07-18"),
      age: "15세 이상",
      genre: ["액션", "범죄", "드라마"],
      runningTime: "152분",
      country: ["미국", "영국"],
      director: ["크리스토퍼 놀란"],
      actor: ["크리스찬 베일", "히스 레저", "아론 에크하트"],
      overview: "고담시의 영웅 배트맨과 광적인 악당 조커의 대결",
      streaming: ["Netflix"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      bgUrl: "",
      feelterTime: ["밤"],
      feelterPurpose: ["자극"],
      feelterOccasion: ["혼자"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      tmdbid: 13,
      title: "포레스트 검프",
      release: new Date("1994-07-06"),
      age: "12세 이상",
      genre: ["드라마", "로맨스"],
      runningTime: "142분",
      country: ["미국"],
      director: ["로버트 저메키스"],
      actor: ["톰 행크스", "로빈 라이트", "게리 시니스"],
      overview: "IQ 75의 순수한 남자 포레스트 검프의 인생 이야기",
      streaming: ["Netflix"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      bgUrl: "",
      feelterTime: ["저녁"],
      feelterPurpose: ["감동"],
      feelterOccasion: ["가족"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "4",
      tmdbid: 19404,
      title: "라라랜드",
      release: new Date("2016-12-25"),
      age: "12세 이상",
      genre: ["뮤지컬", "로맨스", "드라마"],
      runningTime: "128분",
      country: ["미국"],
      director: ["데미언 셔젤"],
      actor: ["라이언 고슬링", "엠마 스톤", "존 레전드"],
      overview: "재즈 피아니스트와 배우 지망생의 로맨스",
      streaming: ["Netflix"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
      bgUrl: "",
      feelterTime: ["저녁"],
      feelterPurpose: ["감동"],
      feelterOccasion: ["연인"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "5",
      tmdbid: 238,
      title: "대부",
      release: new Date("1972-03-24"),
      age: "18세 이상",
      genre: ["범죄", "드라마"],
      runningTime: "175분",
      country: ["미국"],
      director: ["프랜시스 포드 코폴라"],
      actor: ["말론 브란도", "알 파치노", "제임스 칸"],
      overview: "뉴욕 마피아 코를레오네 가문의 이야기",
      streaming: ["Netflix"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      bgUrl: "",
      feelterTime: ["밤"],
      feelterPurpose: ["감동"],
      feelterOccasion: ["혼자"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "6",
      tmdbid: 424,
      title: "쉰들러 리스트",
      release: new Date("1993-12-15"),
      age: "15세 이상",
      genre: ["드라마", "역사", "전쟁"],
      runningTime: "195분",
      country: ["미국"],
      director: ["스티븐 스필버그"],
      actor: ["리암 니슨", "벤 킹슬리", "랄프 파인즈"],
      overview: "나치 독일 시대 유대인을 구한 독일인 사업가의 이야기",
      streaming: ["Netflix"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
      bgUrl: "",
      feelterTime: ["저녁"],
      feelterPurpose: ["감동"],
      feelterOccasion: ["혼자"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "7",
      tmdbid: 278,
      title: "쇼생크 탈출",
      release: new Date("1994-09-23"),
      age: "15세 이상",
      genre: ["드라마"],
      runningTime: "142분",
      country: ["미국"],
      director: ["프랭크 다라본트"],
      actor: ["팀 로빈스", "모건 프리먼", "밥 건튼"],
      overview: "무고한 죄수 앤디 듀프레인의 희망과 자유를 향한 여정",
      streaming: ["Netflix"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      bgUrl: "",
      feelterTime: ["저녁"],
      feelterPurpose: ["감동"],
      feelterOccasion: ["혼자"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "8",
      tmdbid: 389,
      title: "12인의 성난 사람들",
      release: new Date("1957-04-13"),
      age: "12세 이상",
      genre: ["드라마", "범죄"],
      runningTime: "96분",
      country: ["미국"],
      director: ["시드니 루멧"],
      actor: ["헨리 폰다", "리 J. 콥", "마틴 발삼"],
      overview: "배심원 12명이 한 청년의 운명을 결정하는 법정 드라마",
      streaming: ["Netflix"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",
      bgUrl: "",
      feelterTime: ["저녁"],
      feelterPurpose: ["감동"],
      feelterOccasion: ["혼자"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "9",
      tmdbid: 129,
      title: "센과 치히로의 행방불명",
      release: new Date("2001-07-20"),
      age: "전체관람가",
      genre: ["애니메이션", "판타지", "모험"],
      runningTime: "125분",
      country: ["일본"],
      director: ["미야자키 하야오"],
      actor: ["이리노 유미", "카미키 류노스케", "나츠키 마리"],
      overview: "신비한 세계에 빠진 소녀 치히로의 모험",
      streaming: ["Netflix"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
      bgUrl: "",
      feelterTime: ["저녁"],
      feelterPurpose: ["감동"],
      feelterOccasion: ["가족"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "10",
      tmdbid: 680,
      title: "펄프 픽션",
      release: new Date("1994-10-14"),
      age: "18세 이상",
      genre: ["범죄", "드라마"],
      runningTime: "154분",
      country: ["미국"],
      director: ["쿠엔틴 타란티노"],
      actor: ["존 트라볼타", "사무엘 L. 잭슨", "우마 서먼"],
      overview: "서로 얽힌 범죄 이야기들을 비선형적으로 그린 영화",
      streaming: ["Netflix"],
      streamingUrl: "",
      youtubeUrl: "",
      imgUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      bgUrl: "",
      feelterTime: ["밤"],
      feelterPurpose: ["자극"],
      feelterOccasion: ["친구"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 영화 데이터를 Movie 타입으로 변환하는 함수
  const convertToMovie = (row: Record<string, unknown>): Movie => {
    return {
      id: String(row.id || ""),
      tmdbid: (row.tmdbid as number) || 0,
      title: (row.title as string) || "",
      release: row.release ? new Date(row.release as string) : new Date(),
      age: (row.age as string) || "전체관람가",
      genre: Array.isArray(row.genre)
        ? (row.genre as string[])
        : (row.genre as string)
        ? (row.genre as string).split(", ")
        : [],
      runningTime: (row.runningTime as string) || "120분",
      country: Array.isArray(row.country)
        ? (row.country as string[])
        : (row.country as string)
        ? (row.country as string).split(", ")
        : [],
      director: Array.isArray(row.director)
        ? (row.director as string[])
        : (row.director as string)
        ? (row.director as string).split(", ")
        : [],
      actor: Array.isArray(row.actor)
        ? (row.actor as string[])
        : (row.actor as string)
        ? (row.actor as string).split(", ")
        : [],
      overview: (row.overview as string) || "",
      streaming: Array.isArray(row.streaming)
        ? (row.streaming as string[])
        : (row.streaming as string)
        ? (row.streaming as string).split(", ")
        : ["Netflix"],
      streamingUrl: (row.streamingUrl as string) || "",
      youtubeUrl: (row.youtubeUrl as string) || "",
      imgUrl: (row.imgUrl as string) || "",
      bgUrl: (row.bgUrl as string) || "",
      feelterTime: Array.isArray(row.feelterTime)
        ? (row.feelterTime as string[])
        : ["저녁"],
      feelterPurpose: Array.isArray(row.feelterPurpose)
        ? (row.feelterPurpose as string[])
        : ["휴식"],
      feelterOccasion: Array.isArray(row.feelterOccasion)
        ? (row.feelterOccasion as string[])
        : ["혼자"],
      rating: (row.rating as number) || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  // 영화 검색 함수
  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    console.log("영화 검색 시작:", query);
    setIsLoading(true);

    try {
      // Supabase 연결 테스트
      console.log("Supabase 연결 테스트 중...");

      // 먼저 movies 테이블에서 검색 시도
      console.log("movies 테이블에서 검색 시도...");
      const { data: moviesData, error: moviesError } = await supabase
        .from("movies")
        .select("*")
        .ilike("title", `%${query}%`)
        .limit(10);

      if (moviesError) {
        console.error("movies 테이블 검색 오류:", moviesError);
        console.error(
          "오류 상세:",
          moviesError.message,
          moviesError.details,
          moviesError.hint
        );
        throw moviesError;
      }

      console.log("movies 테이블 검색 결과:", moviesData?.length || 0, "개");

      if (moviesData && moviesData.length > 0) {
        console.log("movies 테이블에서 결과 발견:", moviesData);
        const convertedMovies = moviesData.map(convertToMovie);
        console.log("변환된 영화 데이터:", convertedMovies);
        setMovies(convertedMovies);
        console.log("setMovies 호출 완료");
        return;
      }

      // movie_with_rating 테이블에서도 검색 시도
      console.log("movie_with_rating 테이블에서 검색 시도...");
      const { data: ratingData, error: ratingError } = await supabase
        .from("movie_with_rating")
        .select("*")
        .ilike("title", `%${query}%`)
        .limit(10);

      if (ratingError) {
        console.error("movie_with_rating 테이블 검색 오류:", ratingError);
        console.error(
          "오류 상세:",
          ratingError.message,
          ratingError.details,
          ratingError.hint
        );
        throw ratingError;
      }

      console.log(
        "movie_with_rating 테이블 검색 결과:",
        ratingData?.length || 0,
        "개"
      );

      if (ratingData && ratingData.length > 0) {
        console.log("movie_with_rating 테이블에서 결과 발견:", ratingData);
        const convertedMovies = ratingData.map(convertToMovie);
        console.log("변환된 영화 데이터:", convertedMovies);
        setMovies(convertedMovies);
        console.log("setMovies 호출 완료");
        return;
      }

      // 데이터베이스에 결과가 없으면 Mock 데이터에서 검색
      console.log("데이터베이스에 결과 없음, Mock 데이터에서 검색");
      const filteredMockMovies = mockMovies.filter((movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      console.log("Mock 데이터 검색 결과:", filteredMockMovies.length, "개");
      console.log("필터링된 Mock 영화:", filteredMockMovies);
      setMovies(filteredMockMovies.slice(0, 10));
      console.log("Mock 데이터 setMovies 호출 완료");
    } catch (error) {
      console.error("영화 검색 오류:", error);
      // 에러 발생 시 Mock 데이터에서 검색
      console.log("에러 발생, Mock 데이터에서 검색");
      const filteredMockMovies = mockMovies.filter((movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      console.log(
        "에러 시 Mock 데이터 검색 결과:",
        filteredMockMovies.length,
        "개"
      );
      setMovies(filteredMockMovies.slice(0, 10));
      console.log("에러 시 Mock 데이터 setMovies 호출 완료");
    } finally {
      console.log("검색 완료, 로딩 상태 해제");
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 영화 데이터 확인
  useEffect(() => {
    const checkMovies = async () => {
      try {
        console.log("=== 영화 데이터베이스 연결 테스트 시작 ===");

        // 환경 변수 확인
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        console.log(
          "Supabase URL 설정:",
          supabaseUrl ? "✅ 설정됨" : "❌ 설정 안됨"
        );
        console.log(
          "Supabase Key 설정:",
          supabaseKey ? "✅ 설정됨" : "❌ 설정 안됨"
        );

        if (!supabaseUrl || !supabaseKey) {
          console.error("❌ Supabase 환경 변수가 설정되지 않았습니다!");
          console.log("Mock 데이터 사용:", mockMovies.length, "개");
          return;
        }

        // Supabase 연결 상태 확인
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        console.log(
          "Supabase 인증 상태:",
          user ? "로그인됨" : "로그인 안됨",
          authError ? `오류: ${authError.message}` : "정상"
        );

        // movies 테이블 확인
        console.log("movies 테이블 연결 테스트...");
        const { data: moviesData, error: moviesError } = await supabase
          .from("movies")
          .select("id, title")
          .limit(5);

        if (moviesError) {
          console.error("movies 테이블 확인 오류:", moviesError);
          console.error(
            "오류 상세:",
            moviesError.message,
            moviesError.details,
            moviesError.hint
          );
        } else {
          console.log("movies 테이블 데이터:", moviesData?.length || 0, "개");
          if (moviesData && moviesData.length > 0) {
            console.log("movies 테이블 샘플 데이터:", moviesData);
          }
        }

        // movie_with_rating 테이블 확인
        console.log("movie_with_rating 테이블 연결 테스트...");
        const { data: ratingData, error: ratingError } = await supabase
          .from("movie_with_rating")
          .select("id, title")
          .limit(5);

        if (ratingError) {
          console.error("movie_with_rating 테이블 확인 오류:", ratingError);
          console.error(
            "오류 상세:",
            ratingError.message,
            ratingError.details,
            ratingError.hint
          );
        } else {
          console.log(
            "movie_with_rating 테이블 데이터:",
            ratingData?.length || 0,
            "개"
          );
          if (ratingData && ratingData.length > 0) {
            console.log("movie_with_rating 테이블 샘플 데이터:", ratingData);
          }
        }

        console.log("Mock 데이터:", mockMovies.length, "개");
        console.log("=== 영화 데이터베이스 연결 테스트 완료 ===");
      } catch (error) {
        console.error("영화 데이터 확인 오류:", error);
        console.log("에러 발생으로 인해 Mock 데이터를 사용합니다.");
      }
    };
    checkMovies();
  }, []);

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        console.log("디바운스 후 검색 실행:", searchQuery);
        searchMovies(searchQuery);
      } else {
        console.log("검색어가 비어있음, 영화 목록 초기화");
        setMovies([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // movies 상태 변경 추적
  useEffect(() => {
    console.log("movies 상태 변경:", movies.length, "개 영화");
    if (movies.length > 0) {
      console.log(
        "영화 목록:",
        movies.map((m) => m.title)
      );
    }
  }, [movies]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 영화 선택 핸들러
  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    onChange(movie.title);
    setSearchQuery(movie.title);
    setIsOpen(false);
  };

  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("입력값 변경:", newValue);
    setSearchQuery(newValue);
    onChange(newValue);

    if (newValue !== selectedMovie?.title) {
      setSelectedMovie(null);
    }

    if (newValue.trim()) {
      console.log("검색어가 있음, 드롭다운 열기");
      setIsOpen(true);
    } else {
      console.log("검색어가 비어있음, 드롭다운 닫기");
      setIsOpen(false);
      setMovies([]);
    }
  };

  // 입력 필드 포커스 핸들러
  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        className="w-full p-4 pr-12 border border-white/20 rounded-xl 
                   text-white placeholder-gray-400 focus:outline-none 
                   focus:bg-white/15 focus:border-CCFF00/50"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />

      {/* 로딩 인디케이터 */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {isLoading ? (
          <div
            className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full"
            style={{ borderColor: "#CCFF00", borderTopColor: "transparent" }}
          ></div>
        ) : (
          <span className="text-gray-400">🔍</span>
        )}
      </div>

      {/* 드롭다운 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-white/20 
                     rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {(() => {
            console.log("드롭다운 렌더링 상태:", {
              isLoading,
              moviesLength: movies.length,
              isOpen,
            });
            return null;
          })()}
          {isLoading ? (
            <div className="p-4 text-center">
              <div
                className="animate-spin w-6 h-6 border-2 border-t-transparent 
                             rounded-full mx-auto mb-2"
                style={{
                  borderColor: "#CCFF00",
                  borderTopColor: "transparent",
                }}
              ></div>
              <p className="text-gray-400 text-sm">검색 중...</p>
            </div>
          ) : movies.length > 0 ? (
            <div className="py-2">
              {movies.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => handleMovieSelect(movie)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 
                             transition-colors duration-200 border-b border-white/5 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    {movie.imgUrl && (
                      <Image
                        src={movie.imgUrl}
                        alt={movie.title}
                        width={48}
                        height={64}
                        className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">
                        {movie.title}
                      </h4>
                      <div className="text-sm text-gray-400 mt-1">
                        <span>{movie.release.getFullYear()}</span>
                        {Array.isArray(movie.genre) &&
                          movie.genre.length > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{movie.genre.slice(0, 2).join(", ")}</span>
                            </>
                          )}
                        {Array.isArray(movie.director) &&
                          movie.director.length > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{movie.director[0]}</span>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-4 text-center">
              <p className="text-gray-400 text-sm">
                &ldquo;{searchQuery}&rdquo;에 대한 검색 결과가 없습니다.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                다른 제목으로 검색해보세요.
              </p>
              <div className="mt-2 text-xs text-gray-600">
                <p>💡 팁: 영화 제목의 일부만 입력해보세요</p>
                <p>
                  예: &ldquo;어벤져스&rdquo;, &ldquo;해리포터&rdquo;,
                  &ldquo;겨울왕국&rdquo;
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* 선택된 영화 정보 표시 */}
      {selectedMovie && (
        <div className="mt-2 p-3 bg-gray-700/50 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            {selectedMovie.imgUrl && (
              <Image
                src={selectedMovie.imgUrl}
                alt={selectedMovie.title}
                width={40}
                height={56}
                className="w-10 h-14 object-cover rounded flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">
                {selectedMovie.title}
              </p>
              <p className="text-gray-400 text-xs">
                {selectedMovie.release.getFullYear()} •{" "}
                {Array.isArray(selectedMovie.genre)
                  ? selectedMovie.genre.slice(0, 2).join(", ")
                  : selectedMovie.genre}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedMovie(null);
                setSearchQuery("");
                onChange("");
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
