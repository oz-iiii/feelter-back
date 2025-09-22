"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityStore } from "@/lib/stores/communityStore";
import { CommunityPost, Comment } from "@/lib/types/community";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    currentPost,
    comments,
    commentsLoading,
    fetchPostById,
    incrementPostViews,
    togglePostLike,
    addComment,
    toggleCommentLike,
  } = useCommunityStore();

  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    const loadPost = async () => {
      if (postId) {
        try {
          await fetchPostById(postId);
          await incrementPostViews(postId);
        } catch (error) {
          console.error("게시글 로드 실패:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPost();
  }, [postId, fetchPostById, incrementPostViews]);

  const handleLike = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (currentPost) {
      try {
        await togglePostLike(currentPost.id, user);
      } catch (error) {
        console.error("좋아요 처리 실패:", error);
      }
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!commentText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    if (!currentPost) return;

    setIsSubmittingComment(true);
    try {
      await addComment(currentPost.id, commentText, user);
      setCommentText("");
      alert("댓글이 작성되었습니다!");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await toggleCommentLike(commentId, user);
    } catch (error) {
      console.error("댓글 좋아요 실패:", error);
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("링크가 복사되었습니다!");
      setShowShareMenu(false);
    });
  };

  const shareToKakao = () => {
    // 카카오톡 공유 (나중에 구현)
    alert("카카오톡 공유 기능은 준비 중입니다.");
    setShowShareMenu(false);
  };

  const getTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return "알 수 없음";
    }
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${diffInDays}일 전`;
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "review":
        return "리뷰";
      case "discussion":
        return "토론";
      case "emotion":
        return "감정";
      default:
        return "일반";
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "review":
        return "bg-blue-100 text-blue-600";
      case "discussion":
        return "bg-green-100 text-green-600";
      case "emotion":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-20 bg-gray-700 rounded mb-4"></div>
            <div className="h-40 bg-gray-700 rounded mb-4"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!currentPost) {
    return (
      <main className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다</h1>
          <button
            onClick={() => router.push("/community")}
            className="px-6 py-3 bg-[#CCFF00] text-black rounded-lg hover:bg-[#B8E600] transition-colors"
          >
            커뮤니티로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* 헤더 */}
      <div className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            뒤로가기
          </button>
          <h1 className="text-xl font-bold">게시글 상세</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* 게시글 상세 내용 */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          {/* 작성자 정보 및 메타데이터 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg mr-4">
                {currentPost.authorAvatar ? (
                  <img
                    src={currentPost.authorAvatar}
                    alt={currentPost.authorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  currentPost.authorName.charAt(0)
                )}
              </div>
              <div>
                <div className="font-semibold">{currentPost.authorName}</div>
                <div className="text-sm text-gray-400">
                  {getTimeAgo(currentPost.createdAt)} • 조회 {currentPost.views}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getPostTypeColor(
                  currentPost.type
                )}`}
              >
                {getPostTypeLabel(currentPost.type)}
              </span>
              {currentPost.status === "new" && (
                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                  NEW
                </span>
              )}
            </div>
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold mb-4">{currentPost.title}</h1>

          {/* 영화 제목 (리뷰인 경우) */}
          {currentPost.movieTitle && (
            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">영화</div>
              <div className="font-semibold">{currentPost.movieTitle}</div>
              {currentPost.rating && (
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-400 mr-2">평점</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < currentPost.rating!
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-400">
                      {currentPost.rating}/5
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 감정 정보 (감정 기록인 경우) */}
          {currentPost.emotion && (
            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {currentPost.emotionEmoji}
                </span>
                <div>
                  <div className="font-semibold">{currentPost.emotion}</div>
                  {currentPost.emotionIntensity && (
                    <div className="text-sm text-gray-400">
                      강도: {currentPost.emotionIntensity}/10
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 본문 내용 */}
          <div className="mb-6 whitespace-pre-wrap leading-relaxed">
            {currentPost.content}
          </div>

          {/* 태그 */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {currentPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-6">
              {/* 좋아요 버튼 */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors ${
                  currentPost.likedBy?.includes(user?.id || "")
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-500"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{currentPost.likes}</span>
              </button>

              {/* 댓글 수 */}
              <div className="flex items-center space-x-2 text-gray-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.255-.949L5 20l1.395-3.72C7.512 15.042 9.201 14 12 14c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8c0 1.537.586 3.07 1.605 4.28z"
                  />
                </svg>
                <span>{currentPost.comments}</span>
              </div>
            </div>

            {/* 공유 버튼 */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                <span>공유</span>
              </button>

              {/* 공유 메뉴 */}
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 min-w-[120px] z-10">
                  <button
                    onClick={shareToClipboard}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors text-sm"
                  >
                    링크 복사
                  </button>
                  <button
                    onClick={shareToKakao}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors text-sm border-t border-gray-700"
                  >
                    카카오톡
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            댓글 ({currentPost.comments})
          </h2>

          {/* 댓글 작성 */}
          <div className="mb-6">
            {user ? (
              <div className="space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#CCFF00] focus:outline-none resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="px-6 py-2 bg-[#CCFF00] text-black rounded-lg hover:bg-[#B8E600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? "작성 중..." : "댓글 작성"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>댓글을 작성하려면 로그인이 필요합니다.</p>
              </div>
            )}
          </div>

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {commentsLoading ? (
              <div className="text-center py-4 text-gray-400">
                댓글을 불러오는 중...
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                        {comment.authorAvatar ? (
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          comment.authorName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-semibold text-sm">
                            {comment.authorName}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {getTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center space-x-1 text-xs transition-colors ${
                              comment.likedBy?.includes(user?.id || "")
                                ? "text-red-500"
                                : "text-gray-400 hover:text-red-500"
                            }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{comment.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>첫 번째 댓글을 작성해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
