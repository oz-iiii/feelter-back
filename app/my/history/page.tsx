"use client";

import { useState } from "react";
import Image from "next/image";
import MyLayout from "@/components/my/MyLayout";
import { useWatchHistoryStore } from "@/lib/stores/watchHistoryStore";
import { handleOTTRedirect } from "@/lib/utils/ottRedirect";

type HistoryItem = {
  id: string;
  title: string;
  poster: string;
  rating: number;
  duration: string;
  genre: string[];
  director?: string[];
  watchDate?: string;
};

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [selectedMovies, setSelectedMovies] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { watchHistory, removeFromWatchHistory, clearWatchHistory, addToWatchHistory } = useWatchHistoryStore();
  
  // watchHistoryStore의 데이터를 HistoryItem 형식으로 변환
  const historyItems: HistoryItem[] = watchHistory.map((item) => ({
    id: item.id,
    title: item.title,
    poster: item.poster || "/images/parasite.jpg",
    rating: item.rating || item.movieData.rating || 0,
    duration: item.movieData.runningTime || "120분",
    genre: Array.isArray(item.movieData.genre) ? item.movieData.genre : [item.movieData.genre || "드라마"],
    director: Array.isArray(item.movieData.director) ? item.movieData.director : [item.movieData.director || "미상"],
    watchDate: item.watchDate,
  }));

  const toggleMovieSelection = (movieId: string) => {
    const newSelection = new Set(selectedMovies);
    if (newSelection.has(movieId)) {
      newSelection.delete(movieId);
    } else {
      newSelection.add(movieId);
    }
    setSelectedMovies(newSelection);
  };

  const selectAllMovies = () => {
    if (selectedMovies.size === historyItems.length) {
      setSelectedMovies(new Set());
    } else {
      setSelectedMovies(new Set(historyItems.map((movie) => movie.id)));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`선택된 ${selectedMovies.size}개의 시청 이력을 삭제하시겠습니까?`)) {
      selectedMovies.forEach(movieId => {
        removeFromWatchHistory(movieId);
      });
      setSelectedMovies(new Set());
      setIsSelectionMode(false);
    }
  };

  const filteredHistory = historyItems.filter((movie) => {
    if (filter === "all") return true;
    if (filter === "recent") {
      // 최근 7일 내 시청한 영화
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const watchDate = new Date(movie.watchDate?.replace(/\./g, '-') || '');
      return watchDate >= sevenDaysAgo;
    }
    if (filter === "high-rated") return movie.rating >= 4.0;
    return true;
  });

  return (
    <MyLayout>
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">시청 이력</h1>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {!isSelectionMode ? (
              <>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-white text-center text-sm"
                >
                  <option value="all">전체</option>
                  <option value="recent">최근 시청</option>
                  <option value="high-rated">높은 평점</option>
                </select>

                <div className="flex overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 border-r border-gray-200 text-sm ${
                      viewMode === "grid"
                        ? "text-white"
                        : "text-neutral-400 text-xs"
                    }`}
                  >
                    격자
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 text-sm ${
                      viewMode === "list"
                        ? "text-white"
                        : "text-neutral-400 text-xs"
                    }`}
                  >
                    목록
                  </button>
                </div>

                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  선택 모드
                </button>

                <button
                  onClick={clearWatchHistory}
                  className="px-4 py-2 bg-rose-800 text-sm text-neutral-300 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                >
                  전체 삭제
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-white">
                  {selectedMovies.size}개 선택됨
                </span>
                <button
                  onClick={selectAllMovies}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  {selectedMovies.size === filteredHistory.length ? "전체 해제" : "전체 선택"}
                </button>
                {selectedMovies.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    선택 삭제
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedMovies(new Set());
                  }}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  취소
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="bg-neutral-900 rounded-lg inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 px-4 py-2">
            <span className="text-sm text-gray-400">총 시청:</span>
            <span className="text-lg font-bold text-[#ccff00] ml-2">{historyItems.length}편</span>
          </div>
          <div className="bg-neutral-900 rounded-lg inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 px-4 py-2">
            <span className="text-sm text-gray-400">평균 평점:</span>
            <span className="text-lg font-bold text-yellow-500 ml-2">
              {historyItems.length > 0 ? (
                (historyItems.reduce((sum, movie) => sum + movie.rating, 0) /
                historyItems.length) / 10
              ).toFixed(1) : "0.0"}
            </span>
          </div>
          <div className="bg-neutral-900 rounded-lg inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 px-4 py-2">
            <span className="text-sm text-gray-400">이번 달:</span>
            <span className="text-lg font-bold text-green-600 ml-2">{historyItems.length}편</span>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredHistory.map((movie) => (
              <div
                key={movie.id}
                className={`group bg-neutral-900 rounded-lg
            inset-shadow-xs inset-shadow-white/30
            shadow-xs shadow-white/30 overflow-hidden border-0 outline-none ${
              isSelectionMode && selectedMovies.has(movie.id)
                ? "ring-2 ring-blue-500 scale-105"
                : ""
            }`}
              >
                <div className="relative w-full aspect-[2/3] overflow-hidden">
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                  {isSelectionMode ? (
                    <button
                      onClick={() => toggleMovieSelection(movie.id)}
                      className="absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white bg-black bg-opacity-50 flex items-center justify-center transition-all"
                    >
                      {selectedMovies.has(movie.id) && (
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => removeFromWatchHistory(movie.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 truncate">
                    {movie.title}
                  </h3>
                  {movie.rating > 0 && (
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-white font-medium">
                        {(movie.rating / 10).toFixed(1)}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mb-2">
                    {movie.watchDate}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {movie.genre?.join(", ") || "기타"}
                  </p>
                  <div className="flex space-x-1 mt-3">
                    <button
                      onClick={() => handleOTTRedirect(movie.movieData, addToWatchHistory)}
                      className="flex-1 px-2 py-1 text-xs bg-[#dde66e] hover:bg-[#b8e600] text-black rounded transition-colors"
                    >
                      보러가기
                    </button>
                    {!isSelectionMode && (
                      <button
                        onClick={() => removeFromWatchHistory(movie.id)}
                        className="px-2 py-1 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div
            className="bg-neutral-900 rounded-lg 
            inset-shadow-xs inset-shadow-white/30
            shadow-xs shadow-white/30"
          >
            <div className="p-6 border-b border-neutral-700">
              <h2 className="text-xl font-semibold text-white">
                시청 목록 ({filteredHistory.length}편)
              </h2>
            </div>
            <div className="divide-y divide-neutral-700">
              {filteredHistory.map((movie) => (
                <div
                  key={movie.id}
                  className={`p-6 hover:bg-neutral-800 transition-colors ${
                    isSelectionMode && selectedMovies.has(movie.id)
                      ? "bg-neutral-800 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {isSelectionMode && (
                      <button
                        onClick={() => toggleMovieSelection(movie.id)}
                        className="w-6 h-6 rounded border-2 border-gray-400 flex items-center justify-center transition-all"
                      >
                        {selectedMovies.has(movie.id) && (
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Movie Poster */}
                    <div className="relative w-24 h-36">
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="96px"
                      />
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {movie.title}
                          </h3>
                          <p className="text-gray-400 mb-1">
                            감독: {movie.director?.join(", ") || "미상"} • {movie.duration}
                          </p>
                          <p className="text-gray-400 mb-3">
                            장르: {movie.genre?.join(", ") || "기타"}
                          </p>
                          <p className="text-sm text-gray-500">
                            시청일: {movie.watchDate}
                          </p>
                        </div>

                        {/* Rating and Actions */}
                        <div className="text-right">
                          {movie.rating > 0 && (
                            <div className="flex items-center justify-end mb-3">
                              <svg
                                className="w-5 h-5 text-yellow-400 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-white font-medium">
                                {(movie.rating / 10).toFixed(1)}
                              </span>
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleOTTRedirect(movie.movieData, addToWatchHistory)}
                              className="px-3 py-1 text-sm bg-[#DDE66E] hover:bg-[#b8e600] text-black rounded transition-colors"
                            >
                              보러가기
                            </button>
                            {!isSelectionMode && (
                              <button
                                onClick={() => removeFromWatchHistory(movie.id)}
                                className="px-3 py-1 text-sm border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MyLayout>
  );
}
