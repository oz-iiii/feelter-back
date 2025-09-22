"use client";

import Link from "next/link";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMovieStore } from "@/lib/stores";
import { advancedKoreanSearch } from "@/lib/utils/koreanSearch";
// Since the environment can't resolve 'next/link', we will use a standard anchor tag.
// This will still work for navigation within the component.
interface NavbarProps {
  onMySidebarToggle?: () => void;
}

export default function Header({ onMySidebarToggle }: NavbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { movies, fetchMovies } = useMovieStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const pathname = usePathname();
  const isMyPage = pathname.startsWith("/my");
  const isSearchPage = pathname.startsWith("/search");

  // 영화 데이터 로드
  React.useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // 검색 자동완성 업데이트
  const updateSuggestions = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 테스트용 영화 제목들
    const testMovieTitles = [
      "파이널 데스티네이션",
      "토이 스토리",
      "퍼펙트 데이즈",
      "포레스트 검프",
    ];

    // 영화 제목에서 검색어와 매칭되는 항목들 찾기
    const movieTitles =
      movies.length > 0 ? movies.map((movie) => movie.title) : testMovieTitles;

    const matchedMovies = movieTitles
      .filter((title) => advancedKoreanSearch(title, query))
      .slice(0, 5); // 최대 5개까지만

    console.log("자동완성 검색:", query, "→ 결과:", matchedMovies);
    setSuggestions(matchedMovies);
    setShowSuggestions(matchedMovies.length > 0);
  };

  // 검색을 실행하고 서치페이지로 이동하는 함수
  const performSearch = (searchTerm?: string) => {
    const finalQuery = searchTerm || searchQuery;
    console.log("헤더에서 검색 실행:", finalQuery);
    if (finalQuery.trim() !== "") {
      // 서치페이지로 이동하면서 검색어를 URL 파라미터로 전달
      const searchUrl = `/search?q=${encodeURIComponent(finalQuery.trim())}`;
      console.log("이동할 URL:", searchUrl);
      router.push(searchUrl);
      setShowSuggestions(false);
    }
  };

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateSuggestions(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      performSearch();
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    performSearch(suggestion);
  };

  const handleInputBlur = () => {
    // 약간의 딜레이를 주어 클릭 이벤트가 먼저 처리되도록 함
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleMySidebarToggle = () => {
    if (onMySidebarToggle) {
      onMySidebarToggle();
    } else if (
      typeof window !== "undefined" &&
      typeof (window as Window & { toggleMySidebar?: () => void })
        .toggleMySidebar === "function"
    ) {
      (window as Window & { toggleMySidebar?: () => void }).toggleMySidebar!();
    }
  };

  return (
    <header className="border-b border-neutral-500 bg-black p-4 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* 1. 로고 - 로그인 상태에 따라 다른 화면으로 이동 */}
        <Link
          href={user ? "/home" : "/"}
          className="text-xl font-bold text-white"
        >
          Feelter
        </Link>

        {/* 2. 검색창 (검색 페이지에서도 공간은 유지) */}
        <div className="flex-grow flex justify-center mx-4">
          <div
            className={`relative w-full max-w-[500px] ${
              isSearchPage ? "invisible pointer-events-none" : ""
            }`}
          >
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="영화, 드라마, 예능을 검색하세요"
                className="w-full px-4 py-2 pr-10 rounded-full border border-gray-600 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ccff00] text-white placeholder-gray-400"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
                onFocus={() => updateSuggestions(searchQuery)}
                suppressHydrationWarning
              />
              {/* 돋보기 버튼 */}
              <button
                onClick={() => performSearch()}
                className="absolute right-0 pr-3 focus:outline-none"
                aria-label="Search"
                suppressHydrationWarning
              >
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* 검색 자동완성 드롭다운 */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-600 last:border-b-0 text-white transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span className="truncate text-white">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. 데스크톱 내비게이션 링크 */}
        <nav className="hidden md:flex text-sm space-x-4">
          <Link href="/home" className="text-gray-300 hover:text-[#ccff00]">
            Home
          </Link>
          <Link href="/search" className="text-gray-300 hover:text-[#ccff00]">
            Search
          </Link>
          <Link
            href="/community"
            className="text-gray-300 hover:text-[#ccff00]"
          >
            Community
          </Link>
          <Link href="/my" className="text-gray-300 hover:text-[#ccff00]">
            My
          </Link>
        </nav>

        {/* 4. 모바일 아이콘들 (마이페이지 & 햄버거) */}
        <div className="flex items-center space-x-2 md:hidden">
          {/* 햄버거 아이콘 */}
          <button
            onClick={handleToggleMenu}
            className="text-white focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* 마이페이지 아이콘 -toggle sidebar */}
          {isMyPage ? (
            <button onClick={handleMySidebarToggle} title="마이페이지 메뉴">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          ) : (
            <Link href="/my" className="text-white p-2" title="마이페이지">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* 5. 모바일 메뉴 (isMenuOpen 상태일 때만 보임) */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-2 space-y-2 border-t border-gray-700 mt-4 flex flex-col items-center">
          <Link
            href="/home"
            className="text-white w-full text-center py-2 hover:bg-neutral-800 rounded-md"
          >
            Home
          </Link>
          <Link
            href="/search"
            className="text-white w-full text-center py-2 hover:bg-neutral-800 rounded-md"
          >
            Search
          </Link>
          <Link
            href="/community"
            className="text-white w-full text-center py-2 hover:bg-neutral-800 rounded-md"
          >
            Community
          </Link>
          <Link
            href="/my"
            className="text-white w-full text-center py-2 hover:bg-neutral-800 rounded-md"
          >
            My
          </Link>
        </div>
      )}
    </header>
  );
}
