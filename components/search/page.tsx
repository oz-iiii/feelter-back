"use client";

import React, { useState, useEffect, useCallback } from "react";
import SearchBar from "./SearchBar";
import ContentGrid from "./ContentGrid";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import MovieModal from "./MovieModal";
import { ContentItem, MASTER_DATA } from "@/lib/data";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const pageSize = 8;

  // 기본 콘텐츠 샘플 (sampleContent 대체)
  const baseContent: ContentItem[] = [
    {
      title: "샘플 영화 A",
      year: 2024,
      genre: "드라마",
      rating: 8.2,
      poster: "/among-us-poster.png",
      popularity: 90,
      description: "감동적인 스토리의 드라마 영화",
    },
    {
      title: "샘플 영화 B",
      year: 2023,
      genre: ["액션", "스릴러"],
      rating: 7.6,
      poster: "/among-us-poster.png",
      popularity: 80,
      description: "짜릿한 액션과 서스펜스",
    },
    {
      title: "샘플 시리즈 C",
      year: 2022,
      genre: "코미디",
      rating: 8.9,
      poster: "/among-us-poster.png",
      popularity: 95,
      description: "유쾌한 에피소드가 가득한 시리즈",
    },
  ];

  const buildLargeDataset = (times: number = 10): ContentItem[] => {
    const arr: ContentItem[] = [];
    for (let i = 0; i < times; i += 1) {
      arr.push(
        ...baseContent.map((x: ContentItem, idx: number) => ({
          ...x,
          title: `${x.title} ${i + 1}-${idx + 1}`,
        }))
      );
    }
    return arr;
  };

  const [largeDataset, setLargeDataset] = useState<ContentItem[]>(() =>
    buildLargeDataset(8)
  );

  const sortDataset = useCallback(
    (dataset: ContentItem[], sortKey: string): ContentItem[] => {
      function getSortValue(item: ContentItem) {
        switch (sortKey) {
          case "latest":
            return item.year || 0;
          case "popular":
            return item.popularity || 0;
          case "rating":
            return item.rating || 8.0;
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
        return Number(getSortValue(b)) - Number(getSortValue(a));
      });
    },
    []
  );

  useEffect(() => {
    setLargeDataset((prevDataset) => sortDataset(prevDataset, currentSort));
  }, [currentSort, sortDataset]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isSidebarOpen]);

  const filteredData = searchQuery
    ? largeDataset.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : largeDataset;

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
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ContentGrid
            content={currentContent}
            totalItems={filteredData.length}
            currentSort={currentSort}
            setCurrentSort={setCurrentSort}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onCardClick={(item) => setSelectedContent(item)}
          />
        </div>
      </main>
      <MovieModal
        content={selectedContent}
        onClose={() => setSelectedContent(null)}
      />
      <Footer />
    </div>
  );
}
