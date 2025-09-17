"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BiSearch, BiMenuAltLeft, BiX } from "react-icons/bi";
import { useDebounce } from "@/lib/hooks/useDebounce";

export interface SearchBarProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
  initialQuery?: string;
}

function SearchBar({
  onMenuClick,
  onSearch,
  initialQuery = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  // initialQuery가 변경되면 query 업데이트 (한 번만)
  useEffect(() => {
    if (initialQuery !== query) {
      console.log("📝 SearchBar 검색어 업데이트:", initialQuery);
      setQuery(initialQuery);
    }
  }, [initialQuery, query]);

  // 300ms 디바운스 적용 (한글 입력 고려)
  const debouncedQuery = useDebounce(query, 300);

  // 디바운스된 검색어로 실시간 검색 실행
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClearSearch = () => {
    setQuery("");
  };

  return (
    <section className="relative py-20 text-center overflow-hidden min-h-[360px]">
      {/* Background image layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/search-bg.jpeg"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="relative z-10">
        <h1 className="font-bold text-[36px] text-white leading-tight">
          모든 OTT 콘텐츠를 한 번에 찾으세요
        </h1>
        <p className="font-medium text-[20px] text-[#B0B3B8] mt-4 mb-8">
          넷플릭스, 디즈니+, 웨이브, 티빙… 여기서 전부 검색하세요
        </p>
        <form
          role="search"
          className="flex items-center w-[480px] mx-auto bg-[#141A28] rounded-full p-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#CCFF00]"
          onSubmit={handleSearch}
        >
          <button
            type="button"
            aria-label="메뉴 열기"
            onClick={onMenuClick}
            className="p-2 text-[#B0B3B8] hover:text-white"
          >
            <BiMenuAltLeft size={28} />
          </button>
          <div className="pl-2 pr-2 border-l border-gray-700">
            <BiSearch size={24} className="text-[#6C757D]" />
          </div>
          <input
            type="text"
            name="searchQuery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="영화, 드라마, 예능을 검색해보세요"
            className="flex-1 min-w-0 py-2 bg-transparent text-white text-base outline-none"
            autoComplete="off"
          />

          {/* 검색어 클리어 버튼 */}
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="검색어 지우기"
            >
              <BiX size={20} />
            </button>
          )}

          <button
            className="font-bold uppercase bg-[#CCFF00] text-black rounded-full px-6 py-2.5 text-[16px] hover:shadow-[0_0_15px_#CCFF00] transition-shadow duration-300"
            aria-label="검색"
            type="submit"
          >
            검색
          </button>
        </form>
      </div>
    </section>
  );
}

export default SearchBar;
