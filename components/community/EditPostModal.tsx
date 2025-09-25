"use client";

import { useState, useEffect } from "react";
import { CommunityPost } from "@/lib/types/community";
import MovieSearchInput from "./MovieSearchInput";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  onSave: (postId: string, updates: Partial<CommunityPost>) => Promise<void>;
}

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  onSave,
}: EditPostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때 게시글 데이터로 폼 초기화
  useEffect(() => {
    if (post && isOpen) {
      setTitle(post.title);
      setContent(post.content);
      setMovieTitle(post.movieTitle || "");
      setRating(post.rating || 0);
      setTags(post.tags || []);
      setTagInput("");
      setError(null);
    }
  }, [post, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setIsLoading(true);
    setError(null);

    try {
      const updates: Partial<CommunityPost> = {
        title,
        content,
        movieTitle: movieTitle || undefined,
        rating: post.type === "review" ? rating : undefined,
        tags,
      };

      await onSave(post.id, updates);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "게시글 수정에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-white/10 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">게시글 수정</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="bg-gray-700/50 rounded-xl border border-white/10 p-4">
              <label className="block text-lg font-bold text-white mb-3">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-white/15"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                placeholder="게시글 제목을 입력하세요"
                required
              />
            </div>

            {/* Movie Title (for review and discussion posts) */}
            {(post.type === "review" || post.type === "discussion") && (
              <div className="bg-gray-700/50 rounded-xl border border-white/10 p-4">
                <label className="block text-lg font-bold text-white mb-3">
                  영화/드라마 제목
                </label>
                <MovieSearchInput
                  value={movieTitle}
                  onChange={setMovieTitle}
                  placeholder="영화 또는 드라마 제목을 검색하세요"
                />
              </div>
            )}

            {/* Rating (for review posts only) */}
            {post.type === "review" && (
              <div className="bg-gray-700/50 rounded-xl border border-white/10 p-4">
                <label className="block text-lg font-bold text-white mb-3">
                  평점
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${
                        star <= rating ? "text-yellow-400" : "text-gray-400"
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="text-white ml-2">{rating}/5</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="bg-gray-700/50 rounded-xl border border-white/10 p-4">
              <label className="block text-lg font-bold text-white mb-3">
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-white/15 resize-none"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                placeholder="게시글 내용을 입력하세요"
                rows={6}
                required
              />
            </div>

            {/* Tags */}
            <div className="bg-gray-700/50 rounded-xl border border-white/10 p-4">
              <label className="block text-lg font-bold text-white mb-3">
                태그
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-2 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-white/15"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  placeholder="태그를 입력하세요"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: "#CCFF00", color: "#111111" }}
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: "rgba(204, 255, 0, 0.2)",
                      color: "#CCFF00",
                      border: "1px solid rgba(204, 255, 0, 0.3)",
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-gray-300 hover:text-white hover:bg-white/10"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-black disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#CCFF00" }}
              >
                {isLoading ? "수정 중..." : "수정하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
