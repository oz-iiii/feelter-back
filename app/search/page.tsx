"use client";

import React, { useState, useEffect, useCallback } from "react";
import SearchBar from "@/components/search/SearchBar";
import ContentGrid from "@/components/search/ContentGrid";
import Sidebar from "@/components/search/Sidebar";
import MovieModal from "@/components/search/MovieModal";
import { ContentItem, MASTER_DATA } from "@/lib/data";
import { useMovieStore } from "@/lib/stores";
import { Movie } from "@/lib/types/movie";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper function to convert Movie to ContentItem
const movieToContentItem = (movie: Movie): ContentItem => ({
  title: movie.title,
  year: movie.release instanceof Date 
    ? movie.release.getFullYear() 
    : new Date(movie.release).getFullYear(),
  genre: movie.genre,
  rating: 8.5, // Default rating since Movie doesn't have rating
  poster: movie.imgUrl,
  popularity: 85, // Default popularity
  description: movie.overview,
});

export default function SearchPage() {
  const { movies, loading, fetchMovies } = useMovieStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const pageSize = 8;

  // Convert movies to ContentItem format for compatibility
  const contentDataset = movies.map(movieToContentItem);

  // Test if useEffect works at all
  useEffect(() => {
    console.log("🔄 Search page: Basic useEffect running!");
  }, []);

  useEffect(() => {
    console.log("🔄 Search page: fetchMovies useEffect running, calling API directly");
    
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        console.log("🔄 Search page: Got API response:", data.success, data.data?.length);
      })
      .catch(err => {
        console.error("🔄 Search page: API error:", err);
      });
  }, []); // Remove fetchMovies from dependency array

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

  const filteredData = searchQuery
    ? sortedDataset?.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    : sortedDataset || [];

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
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-white">영화 데이터를 불러오는 중...</div>
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
            />
          )}
        </div>
      </main>
      <MovieModal content={selectedContent} onClose={handleCloseModal} />
    </div>
  );
}