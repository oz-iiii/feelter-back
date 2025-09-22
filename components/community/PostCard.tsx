"use client";

import { useState } from "react";
import { CommunityPost } from "@/lib/types/community";
import { postService } from "@/lib/services/communityService";
import { useAuthStore } from "@/lib/stores/authStore";

interface PostCardProps {
  post: CommunityPost;
  onPostUpdate?: () => void;
}

export default function PostCard({ post, onPostUpdate }: PostCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated || !user || isLiking) return;

    setIsLiking(true);
    try {
      await postService.toggleLike(post.id, user.uid);
      onPostUpdate?.();
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  const getTypeIcon = () => {
    switch (post.type) {
      case "review":
        return "⭐";
      case "discussion":
        return "💭";
      case "emotion":
        return post.emotionEmoji || "💙";
      default:
        return "📝";
    }
  };

  const getTypeLabel = () => {
    switch (post.type) {
      case "review":
        return "리뷰";
      case "discussion":
        return "토론";
      case "emotion":
        return "감정 기록";
      default:
        return "일반";
    }
  };

  return (
    <article className="bg-gray-800 rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#CCFF00] flex items-center justify-center text-black font-bold">
              {post.authorName.charAt(0)}
            </div>
          )}
          <div>
            <h4 className="text-white font-medium">{post.authorName}</h4>
            <p className="text-gray-400 text-sm">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{getTypeIcon()}</span>
          <span className="text-sm text-gray-300">{getTypeLabel()}</span>
          {post.status === "hot" && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              HOT
            </span>
          )}
        </div>
      </div>

      {/* Movie Title */}
      {post.movieTitle && (
        <div className="mb-3">
          <span className="text-[#CCFF00] font-medium">
            🎬 {post.movieTitle}
          </span>
          {post.rating && (
            <span className="ml-2 text-yellow-400">
              {"★".repeat(post.rating)}
              {"☆".repeat(5 - post.rating)} ({post.rating}/5)
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="text-white font-bold text-lg mb-3 line-clamp-2">
        {post.title}
      </h3>

      {/* Content */}
      <div className="text-gray-300 mb-4 line-clamp-3">{post.content}</div>

      {/* Emotion Display */}
      {post.type === "emotion" && post.emotion && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{post.emotionEmoji}</span>
            <span className="text-white font-medium">{post.emotion}</span>
          </div>
          {post.emotionIntensity && (
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < (post.emotionIntensity || 0)
                      ? "bg-[#CCFF00]"
                      : "bg-gray-600"
                  }`}
                />
              ))}
              <span className="text-gray-400 text-sm ml-2">
                강도 {post.emotionIntensity || 0}/5
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-white/10 text-gray-300 text-sm px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isLiking || !isAuthenticated}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
              isAuthenticated && user && post.likedBy.includes(user.uid)
                ? "text-red-400 bg-red-400/20"
                : "text-gray-400 hover:text-red-400 hover:bg-red-400/10"
            } disabled:opacity-50`}
          >
            <span>❤️</span>
            <span>{post.likes}</span>
          </button>

          <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-400/10 transition-colors">
            <span>💬</span>
            <span>{post.comments}</span>
          </button>

          <div className="flex items-center gap-2 text-gray-400">
            <span>👀</span>
            <span>{post.views}</span>
          </div>
        </div>

        <button className="text-gray-400 hover:text-white p-1">
          <span>⋯</span>
        </button>
      </div>
    </article>
  );
}
