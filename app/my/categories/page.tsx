"use client";

import { useState } from "react";
import Image from "next/image";
import MyLayout from "@/components/my/MyLayout";
import { useCategoryStore } from "@/lib/stores";

export default function CategoriesPage() {
  const {
    categories,
    updateCategory,
    deleteCategory,
    removeMovieFromCategory,
  } = useCategoryStore();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleEditCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      setEditingCategory(categoryId);
      setEditName(category.name);
      setEditDescription(category.description || "");
    }
  };

  const handleSaveEdit = (categoryId: string) => {
    updateCategory(categoryId, {
      name: editName,
      description: editDescription || undefined,
    });
    setEditingCategory(null);
    setEditName("");
    setEditDescription("");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
    setEditDescription("");
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("이 카테고리를 삭제하시겠습니까?")) {
      deleteCategory(categoryId);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <MyLayout>
      <div className="w-full max-w-4xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">나의 카테고리</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="bg-neutral-900 rounded-lg inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 px-4 py-2">
            <span className="text-sm text-gray-400">총 카테고리:</span>
            <span className="text-lg font-bold text-[#ccff00] ml-2">{categories.length}개</span>
          </div>
          <div className="bg-neutral-900 rounded-lg inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 px-4 py-2">
            <span className="text-sm text-gray-400">총 영화:</span>
            <span className="text-lg font-bold text-yellow-500 ml-2">{categories.reduce((total, cat) => total + cat.movies.length, 0)}편</span>
          </div>
          <div className="bg-neutral-900 rounded-lg inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 px-4 py-2">
            <span className="text-sm text-gray-400">평균:</span>
            <span className="text-lg font-bold text-green-600 ml-2">{categories.length > 0 ? Math.round(categories.reduce((total, cat) => total + cat.movies.length, 0) / categories.length) : 0}편</span>
          </div>
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
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
                d="M19 11H5m14-5v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v5zM9 11h2v2H9v-2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">
              생성된 카테고리가 없습니다
            </h3>
            <p className="text-gray-400">
              즐겨찾기에서 영화를 선택하여 카테고리를 만들어보세요.
            </p>
          </div>
        )}

        {/* Categories List */}
        {categories.length > 0 && (
          <div className="space-y-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-neutral-900 rounded-lg
                inset-shadow-xs inset-shadow-white/30
                shadow-xs shadow-white/30 overflow-hidden"
              >
                {/* Category Header */}
                <div className="p-6 border-b border-neutral-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingCategory === category.id ? (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="카테고리 이름"
                          />
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="설명 (선택사항)"
                          />
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleSaveEdit(category.id)}
                              disabled={!editName.trim()}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                              저장
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-4 mb-2">
                            <h2 className="text-xl font-semibold text-white">
                              {category.name}
                            </h2>
                            <span className="bg-[#404400] text-[#e6ff4d] text-sm font-medium px-2.5 py-0.5 rounded">
                              {category.movies.length}편
                            </span>
                          </div>
                          {category.description && (
                            <p className="text-gray-400 mb-2">
                              {category.description}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            생성일:{" "}
                            {category.createdAt instanceof Date
                              ? category.createdAt.toLocaleDateString()
                              : new Date(
                                  category.createdAt
                                ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {editingCategory !== category.id && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          {expandedCategory === category.id ? "접기" : "펼치기"}
                        </button>
                        <button
                          onClick={() => handleEditCategory(category.id)}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
                        >
                          편집
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Movies */}
                {expandedCategory === category.id && (
                  <div className="p-6">
                    {category.movies.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">
                        이 카테고리에 추가된 영화가 없습니다.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {category.movies.map((movie) => (
                          <div
                            key={movie.id}
                            className="bg-gray-700 rounded-lg overflow-hidden group hover:shadow-lg transition-all"
                          >
                            <div className="relative">
                              <Image
                                src={movie.imgUrl}
                                alt={movie.title}
                                width={150}
                                height={225}
                                className="w-full h-48 object-cover"
                              />
                              <button
                                onClick={() =>
                                  removeMovieFromCategory(
                                    category.id,
                                    Number(movie.id)
                                  )
                                }
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg
                                  className="w-3 h-3"
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
                            </div>
                            <div className="p-3">
                              <h3 className="font-medium text-white text-sm truncate mb-1">
                                {movie.title}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {movie.release instanceof Date
                                  ? movie.release.getFullYear()
                                  : new Date(movie.release).getFullYear()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MyLayout>
  );
}
