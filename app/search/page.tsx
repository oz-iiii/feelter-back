"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/search/SearchBar";
import ContentGrid from "@/components/search/ContentGrid";
import Sidebar from "@/components/search/Sidebar";
import MovieModal from "@/components/search/MovieModal";
import ActiveFilters from "@/components/search/ActiveFilters";
import { ContentItem, MASTER_DATA } from "@/lib/data";
import { useMovieStore } from "@/lib/stores";
import { Movie } from "@/lib/types/movie";
import { advancedKoreanSearch } from "@/lib/utils/koreanSearch";
import { FilterProvider, useFilter } from "@/lib/contexts/FilterContext";
import { applyFilters } from "@/lib/utils/filterUtils";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Helper function to convert Movie to ContentItem
const movieToContentItem = (movie: Movie): ContentItem => ({
  title: movie.title,
  year:
    movie.release instanceof Date
      ? movie.release.getFullYear()
      : new Date(movie.release).getFullYear(),
  genre: movie.genre,
  rating: typeof movie.rating === "number" ? movie.rating : undefined, // 실제 네티즌 평점만 표시
  poster: movie.imgUrl,
  popularity: 85, // Default popularity
  description: movie.overview,
  age: movie.age,
  country: movie.country,
  runtime: movie.runningTime,
  platform: movie.streaming,
});

// SearchPage 내부 컴포넌트 (필터 컨텍스트 사용)
function SearchPageContent() {
  const { movies, loading, fetchMovies } = useMovieStore();
  const filters = useFilter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const pageSize = 8;

  // 영화 데이터 로드
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // URL 파라미터에서 검색어 읽기
  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam) {
      const decodedQuery = decodeURIComponent(queryParam);
      console.log("URL에서 읽은 검색어:", decodedQuery);
      setSearchQuery(decodedQuery);
    }
  }, [searchParams]);

  // 테스트용 영화 데이터 (Supabase 연결 문제시 사용)
  const testMovies: ContentItem[] = [
    {
      title: "파이널 데스티네이션",
      year: 2024,
      genre: ["액션", "스릴러"],
      rating: 6.2, // 낮은 평점
      poster: "/images/placeholder.jpg",
      popularity: 85,
      description: "스릴러 영화입니다.",
      age: "15세",
      country: ["미국"],
      runtime: "120분",
      platform: ["Netflix", "Disney+"],
    },
    {
      title: "토이 스토리",
      year: 1995,
      genre: ["애니메이션", "가족"],
      rating: 8.8,
      poster: "/images/placeholder.jpg",
      popularity: 88,
      description: "장난감들의 모험을 그린 픽사 애니메이션입니다.",
      age: "전체관람가",
      country: ["미국"],
      runtime: "90분",
      platform: ["Disney+"],
    },
    {
      title: "퍼펙트 데이즈",
      year: 2023,
      genre: ["드라마"],
      rating: 9.0,
      poster: "/images/placeholder.jpg",
      popularity: 90,
      description: "일상의 아름다움을 그린 영화입니다.",
      age: "12세",
      country: ["일본"],
      runtime: "150분",
      platform: ["Amazon Prime"],
    },
    {
      title: "포레스트 검프",
      year: 1994,
      genre: ["드라마", "로맨스"],
      rating: 9.5,
      poster: "/images/placeholder.jpg",
      popularity: 95,
      description: "감동적인 인생 이야기입니다.",
      age: "12세",
      country: ["미국"],
      runtime: "140분",
      platform: ["Netflix"],
    },
    {
      title: "어벤져스: 엔드게임",
      year: 2019,
      genre: ["액션", "SF", "어드벤처"],
      rating: 8.4,
      poster: "/images/placeholder.jpg",
      popularity: 92,
      description: "마블 시네마틱 유니버스의 대단원.",
      age: "12세",
      country: ["미국"],
      runtime: "181분",
      platform: ["Disney+"],
    },
    {
      title: "어벤져스: 인피니티 워",
      year: 2018,
      genre: ["액션", "SF", "어드벤처"],
      rating: 8.4,
      poster: "/images/placeholder.jpg",
      popularity: 91,
      description: "타노스의 지구 침공.",
      age: "12세",
      country: ["미국"],
      runtime: "149분",
      platform: ["Disney+"],
    },
    {
      title: "스파이더맨: 노 웨이 홈",
      year: 2021,
      genre: ["액션", "SF", "어드벤처"],
      rating: 8.2,
      poster: "/images/placeholder.jpg",
      popularity: 89,
      description: "멀티버스의 스파이더맨들.",
      age: "12세",
      country: ["미국"],
      runtime: "148분",
      platform: ["Disney+"],
    },
    {
      title: "어벤져스",
      year: 2012,
      genre: ["액션", "SF", "어드벤처"],
      rating: 8.0,
      poster: "/images/placeholder.jpg",
      popularity: 87,
      description: "최초의 어벤져스 팀 결성.",
      age: "12세",
      country: ["미국"],
      runtime: "143분",
      platform: ["Disney+"],
    },
    {
      title: "평점 없는 영화",
      year: 2020,
      genre: ["드라마"],
      // rating 없음 - 평점이 없는 영화 테스트용
      poster: "/images/placeholder.jpg",
      popularity: 75,
      description: "평점이 없는 영화입니다.",
      age: "15세",
      country: ["한국"],
      runtime: "110분",
      platform: ["Netflix"],
    },
  ];

  // Convert movies to ContentItem format for compatibility
  const contentDataset =
    movies.length > 0 ? movies.map(movieToContentItem) : testMovies;

  console.log("영화 스토어 로딩 상태:", loading);
  console.log("영화 데이터 개수:", movies.length);
  console.log("사용할 데이터셋 개수:", contentDataset.length);
  if (movies.length > 0) {
    console.log("첫 번째 영화:", movies[0].title);
  } else {
    console.log("테스트 데이터 사용 중");
  }

  const sortDataset = useCallback(
    (dataset: ContentItem[], sortKey: string): ContentItem[] => {
      function getSortValue(item: ContentItem) {
        switch (sortKey) {
          case "latest":
            return item.year || 0;
          case "popular":
            return item.popularity || 0;
          case "rating":
            return item.rating || -1; // 평점이 없으면 -1로 처리 (맨 뒤로 정렬)
          case "title":
            return item.title || "";
          default:
            return 0;
        }
      }

      return [...dataset].sort((a, b) => {
        if (sortKey === "title") {
          return String(getSortValue(a)).localeCompare(String(getSortValue(b)));
        }

        // 평점 정렬시 특별 처리
        if (sortKey === "rating") {
          const aRating = a.rating || -1;
          const bRating = b.rating || -1;

          // 둘 다 평점이 있거나 둘 다 평점이 없는 경우
          if ((aRating >= 0 && bRating >= 0) || (aRating < 0 && bRating < 0)) {
            return Number(bRating) - Number(aRating);
          }
          // 평점이 있는 것을 앞으로, 없는 것을 뒤로
          return bRating - aRating;
        }

        return Number(getSortValue(b)) - Number(getSortValue(a));
      });
    },
    []
  );

  // Apply sorting to dataset
  const sortedDataset = sortDataset(contentDataset, currentSort);

  const handleOpenModal = (content: ContentItem) => {
    setSelectedContent(content);
  };

  const handleCloseModal = () => {
    setSelectedContent(null);
  };

  useEffect(() => {
    if (isSidebarOpen || selectedContent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isSidebarOpen, selectedContent]);

  // 1. 검색어로 필터링
  const searchFilteredData = searchQuery.trim()
    ? sortedDataset?.filter((item) => {
        const isMatch = advancedKoreanSearch(item.title, searchQuery);
        if (isMatch) {
          console.log("✅ 검색 매치:", item.title);
        }
        return isMatch;
      }) || []
    : sortedDataset || [];

  console.log("🔍 검색어:", `"${searchQuery}"`);
  console.log("📚 전체 영화 수:", sortedDataset.length);
  console.log("🎯 검색 결과 수:", searchFilteredData.length);

  if (searchQuery.trim() && searchFilteredData.length > 0) {
    console.log(
      "🎬 검색된 영화들:",
      searchFilteredData.map((item) => item.title)
    );
  }

  // 2. 사이드바 필터 적용
  const filteredData = applyFilters(searchFilteredData, filters);

  const currentContent = filteredData.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  // 필터가 변경될 때 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="text-[#B0B3B8] font-sans min-h-screen bg-[#0A0F1C]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        masterData={MASTER_DATA}
      />
      <div
        className={`fixed inset-0 bg-black/50 z-[900] transition-opacity duration-250 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <main>
        <SearchBar
          onMenuClick={() => setIsSidebarOpen(true)}
          onSearch={handleSearch}
          initialQuery={searchQuery}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ActiveFilters />
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-white">
                영화 데이터를 불러오는 중...
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-white">
                {searchQuery
                  ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                  : "영화 데이터가 없습니다."}
              </div>
            </div>
          ) : (
            <ContentGrid
              content={currentContent}
              totalItems={filteredData.length}
              currentSort={currentSort}
              setCurrentSort={setCurrentSort}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onCardClick={handleOpenModal}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </main>
      <MovieModal content={selectedContent} onClose={handleCloseModal} />
    </div>
  );
}

// 메인 SearchPage 컴포넌트 (FilterProvider로 감싸기)
export default function SearchPage() {
  return (
    <FilterProvider>
      <SearchPageContent />
    </FilterProvider>
  );
}
