"use client";

import { useState } from "react";
import Image from "next/image";
import MyLayout from "@/components/my/MyLayout";
import { useFavoriteStore, useCategoryStore } from "@/lib/stores";
import { Movie } from "@/lib/types/movie";

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavoriteStore();
  const { categories, createCategory, addMoviesToCategory } = useCategoryStore();
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedMovies, setSelectedMovies] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const removeFavorite = (id: string) => {
    removeFromFavorites(id);
  };

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
    if (selectedMovies.size === favorites.length) {
      setSelectedMovies(new Set());
    } else {
      setSelectedMovies(new Set(favorites.map(movie => movie.id)));
    }
  };

  const getSelectedMovieObjects = (): Movie[] => {
    return favorites.filter(movie => selectedMovies.has(movie.id));
  };

  const handleAddToCategory = (categoryId?: string, categoryName?: string) => {
    const selectedMovieObjects = getSelectedMovieObjects();
    console.log('handleAddToCategory called:', { categoryId, categoryName, selectedMovies: selectedMovieObjects.length });
    
    if (categoryName) {
      // 새 카테고리 생성하고 반환된 ID로 바로 영화 추가
      const newCategoryId = createCategory(categoryName);
      console.log('New category created with ID:', newCategoryId);
      addMoviesToCategory(newCategoryId, selectedMovieObjects);
    } else if (categoryId) {
      // 기존 카테고리에 추가
      console.log('Adding to existing category:', categoryId);
      addMoviesToCategory(categoryId, selectedMovieObjects);
    }
    
    setSelectedMovies(new Set());
    setIsSelectionMode(false);
    setShowCategoryModal(false);
    setNewCategoryName("");
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    if (sortBy === "recent")
      return (
        b.createdAt.getTime() - a.createdAt.getTime()
      );
    if (sortBy === "rating") return 8.5 - 8.5; // Default rating since Movie type doesn't have rating
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "year") return (b.release instanceof Date ? b.release.getFullYear() : new Date(b.release).getFullYear()) - (a.release instanceof Date ? a.release.getFullYear() : new Date(a.release).getFullYear());
    return 0;
  });

  return (
    <MyLayout>
      <div className="w-full max-w-4xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">즐겨찾기</h1>
            <span className="bg-[#404400] text-[#e6ff4d] text-sm font-medium px-2.5 py-0.5 rounded">
              {favorites.length}편
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {!isSelectionMode ? (
              <>
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  선택 모드
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
                >
                  <option value="recent">최근 추가</option>
                  <option value="rating">평점순</option>
                  <option value="title">제목순</option>
                  <option value="year">연도순</option>
                </select>

                <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 text-sm ${
                      viewMode === "grid"
                        ? "bg-[#ccff00] text-black"
                        : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    격자
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 text-sm ${
                      viewMode === "list"
                        ? "bg-[#ccff00] text-black"
                        : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    목록
                  </button>
                </div>
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
                  {selectedMovies.size === favorites.length ? "전체 해제" : "전체 선택"}
                </button>
                {selectedMovies.size > 0 && (
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    카테고리에 추가
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

        {/* Empty State */}
        {favorites.length === 0 && (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">
              즐겨찾기가 없습니다
            </h3>
            <p className="text-gray-400">좋아하는 영화를 추가해보세요.</p>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && favorites.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedFavorites.map((movie) => (
              <div
                key={movie.id}
                className={`bg-gray-800 rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-all ${
                  isSelectionMode && selectedMovies.has(movie.id) 
                    ? "ring-2 ring-blue-500 scale-105" 
                    : ""
                }`}
              >
                <div className="relative">
                  <Image
                    src={movie.imgUrl}
                    alt={movie.title}
                    width={200}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  {isSelectionMode ? (
                    <button
                      onClick={() => toggleMovieSelection(movie.id)}
                      className="absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white bg-black bg-opacity-50 flex items-center justify-center transition-all"
                    >
                      {selectedMovies.has(movie.id) && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => removeFavorite(movie.id)}
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
                  <h3 className="font-semibold text-white mb-1 truncate">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">
                    {movie.release instanceof Date ? movie.release.getFullYear() : new Date(movie.release).getFullYear()} • {movie.genre}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-400">
                        8.5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && favorites.length > 0 && (
          <div className="bg-gray-800 rounded-lg shadow-sm">
            <div className="divide-y divide-gray-700">
              {sortedFavorites.map((movie) => (
                <div
                  key={movie.id}
                  className={`p-6 hover:bg-gray-700 transition-colors ${
                    isSelectionMode && selectedMovies.has(movie.id) 
                      ? "bg-gray-700 border-l-4 border-blue-500" 
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {isSelectionMode && (
                      <button
                        onClick={() => toggleMovieSelection(movie.id)}
                        className="w-6 h-6 rounded border-2 border-gray-400 flex items-center justify-center transition-all"
                      >
                        {selectedMovies.has(movie.id) && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}
                    <Image
                      src={movie.imgUrl}
                      alt={movie.title}
                      width={64}
                      height={96}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {movie.title}
                      </h3>
                      <p className="text-gray-400 mb-1">
                        감독: {movie.director} • {movie.release instanceof Date ? movie.release.getFullYear() : new Date(movie.release).getFullYear()}
                      </p>
                      <p className="text-gray-400 mb-2">장르: {movie.genre}</p>
                      <p className="text-sm text-gray-500">
                        추가일: {movie.createdAt instanceof Date ? movie.createdAt.toLocaleDateString() : new Date(movie.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-2">
                        <svg
                          className="w-5 h-5 text-yellow-400 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white font-medium">
                          8.5
                        </span>
                      </div>
                      {!isSelectionMode && (
                        <button
                          onClick={() => removeFavorite(movie.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded transition-colors"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Selection Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                카테고리 선택
              </h3>
              
              {/* Existing Categories */}
              {categories.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    기존 카테고리
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleAddToCategory(category.id)}
                        className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">
                            {category.name}
                          </span>
                          <span className="text-sm text-gray-400">
                            {category.movies.length}편
                          </span>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-400 mt-1">
                            {category.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Category */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  새 카테고리 만들기
                </h4>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="카테고리 이름을 입력하세요"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                {newCategoryName && (
                  <button
                    onClick={() => handleAddToCategory(undefined, newCategoryName)}
                    className="mt-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    새 카테고리에 추가
                  </button>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MyLayout>
  );
}
