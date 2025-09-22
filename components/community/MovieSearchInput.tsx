"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Movie } from "@/lib/types/movie";

interface MovieSearchInputProps {
  value: string;
  onChange: (movieTitle: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function MovieSearchInput({
  value,
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
      // 먼저 movies 테이블에서 검색 시도
      const { data: moviesData, error: moviesError } = await supabase
        .from("movies")
        .select("*")
        .ilike("title", `%${query}%`)
        .limit(10);

      if (moviesError) {
        console.error("movies 테이블 검색 오류:", moviesError);
        throw moviesError;
      }

      console.log("movies 테이블 검색 결과:", moviesData);

      if (moviesData && moviesData.length > 0) {
        const convertedMovies = moviesData.map(convertToMovie);
        setMovies(convertedMovies);
        return;
      }

      // movie_with_rating 테이블에서도 검색 시도
      const { data: ratingData, error: ratingError } = await supabase
        .from("movie_with_rating")
        .select("*")
        .ilike("title", `%${query}%`)
        .limit(10);

      if (ratingError) {
        console.error("movie_with_rating 테이블 검색 오류:", ratingError);
        throw ratingError;
      }

      console.log("movie_with_rating 테이블 검색 결과:", ratingData);

      if (ratingData && ratingData.length > 0) {
        const convertedMovies = ratingData.map(convertToMovie);
        setMovies(convertedMovies);
        return;
      }

      // 데이터베이스에 결과가 없으면 Mock 데이터에서 검색
      console.log("데이터베이스에 결과 없음, Mock 데이터에서 검색");
      const filteredMockMovies = mockMovies.filter((movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      setMovies(filteredMockMovies.slice(0, 10));
    } catch (error) {
      console.error("영화 검색 오류:", error);
      // 에러 발생 시 Mock 데이터에서 검색
      console.log("에러 발생, Mock 데이터에서 검색");
      const filteredMockMovies = mockMovies.filter((movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      setMovies(filteredMockMovies.slice(0, 10));
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 영화 데이터 확인
  useEffect(() => {
    const checkMovies = async () => {
      try {
        // movies 테이블 확인
        const { data: moviesData, error: moviesError } = await supabase
          .from("movies")
          .select("id, title")
          .limit(5);

        if (moviesError) {
          console.error("movies 테이블 확인 오류:", moviesError);
        } else {
          console.log("movies 테이블 데이터:", moviesData?.length || 0, "개");
        }

        // movie_with_rating 테이블 확인
        const { data: ratingData, error: ratingError } = await supabase
          .from("movie_with_rating")
          .select("id, title")
          .limit(5);

        if (ratingError) {
          console.error("movie_with_rating 테이블 확인 오류:", ratingError);
        } else {
          console.log(
            "movie_with_rating 테이블 데이터:",
            ratingData?.length || 0,
            "개"
          );
        }

        console.log("Mock 데이터:", mockMovies.length, "개");
      } catch (error) {
        console.error("영화 데이터 확인 오류:", error);
      }
    };
    checkMovies();
  }, []);

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== value) {
        searchMovies(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
    setSearchQuery(newValue);
    onChange(newValue);

    if (newValue !== selectedMovie?.title) {
      setSelectedMovie(null);
    }

    if (newValue.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
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
        className="w-full p-4 border border-white/20 rounded-xl 
                   text-white placeholder-gray-400 focus:outline-none 
                   focus:bg-white/15 focus:border-CCFF00/50"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />

      {/* 드롭다운 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-white/20 
                     rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
        >
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
