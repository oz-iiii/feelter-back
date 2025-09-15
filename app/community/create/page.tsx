"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityStore } from "@/lib/stores/communityStore";

type PostType = "review" | "discussion" | "emotion";

export default function CreatePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { addPost } = useCommunityStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState<PostType>("review");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [emotion, setEmotion] = useState("");
  const [emotionIntensity, setEmotionIntensity] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // 로딩 상태 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push("/community");
    }
  }, [user, loading, router]);

  // 로딩 중이거나 인증되지 않은 경우
  if (loading) {
    return (
      <main
        className="min-h-screen pt-[130px] px-4 lg:px-10"
        style={{ backgroundColor: "#111111" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-64 h-12 mx-auto mb-4 rounded-lg animate-pulse bg-gray-700"></div>
            <div className="w-96 h-6 mx-auto rounded-lg animate-pulse bg-gray-700"></div>
          </div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-full h-24 rounded-lg animate-pulse bg-gray-700"
              ></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // useEffect에서 리다이렉트 처리됨
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 감정 이모지 매핑
      const emotionEmojiMap: { [key: string]: string } = {
        슬픔: "😭",
        흥분: "🔥",
        따뜻함: "💖",
        불안: "😰",
        그리움: "🥺",
        기쁨: "😊",
        분노: "😡",
        두려움: "😨",
      };

      const newPost = {
        type: postType,
        title,
        content,
        movieTitle: movieTitle || undefined,
        rating: postType === "review" ? rating : undefined,
        emotion: postType === "emotion" ? emotion : undefined,
        emotionEmoji:
          postType === "emotion" ? emotionEmojiMap[emotion] : undefined,
        emotionIntensity: postType === "emotion" ? emotionIntensity : undefined,
        tags,
        likes: 0,
        likedBy: [],
        comments: 0,
        views: 0,
        isActive: true,
        status: "new" as const,
      };

      await addPost(newPost, user);

      alert("작성이 완료되었습니다!");
      // 커뮤니티 페이지로 돌아가면서 새로고침 플래그 추가
      router.push("/community?refresh=true");
    } catch (error) {
      console.error("작성 실패:", error);
      alert(error instanceof Error ? error.message : "작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      currentTag.trim() &&
      !tags.includes(currentTag.trim()) &&
      tags.length < 10
    ) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
      e.preventDefault();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const renderRatingStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl transition-colors duration-200 ${
              star <= rating
                ? "text-yellow-400"
                : "text-gray-600 hover:text-yellow-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const renderEmotionIntensity = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setEmotionIntensity(level)}
            className={`w-8 h-8 rounded-full transition-colors duration-200 flex items-center justify-center text-sm font-bold ${
              level <= emotionIntensity ? "text-black" : "text-white"
            }`}
            style={{
              backgroundColor:
                level <= emotionIntensity ? "#CCFF00" : "#4B5563",
            }}
          >
            {level}
          </button>
        ))}
      </div>
    );
  };

  return (
    <main
      className="min-h-screen pt-[130px] px-4 lg:px-10"
      style={{ backgroundColor: "#111111" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl lg:text-4xl font-bold mb-4"
            style={{ color: "#CCFF00" }}
          >
            새 글 작성하기
          </h1>
          <p className="text-gray-400 text-lg">
            영화에 대한 생각과 감정을 자유롭게 표현해보세요
          </p>
        </div>

        {/* Post Type Selector */}
        <div className="mb-8 p-6 bg-gray-800 rounded-2xl border border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-4">
            작성할 글의 종류를 선택해주세요
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setPostType("review")}
              className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                postType === "review"
                  ? "text-black"
                  : "text-gray-300 hover:text-white"
              }`}
              style={{
                backgroundColor:
                  postType === "review"
                    ? "#CCFF00"
                    : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <span>⭐</span>
              <span>리뷰 작성</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType("discussion")}
              className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                postType === "discussion"
                  ? "text-black"
                  : "text-gray-300 hover:text-white"
              }`}
              style={{
                backgroundColor:
                  postType === "discussion"
                    ? "#CCFF00"
                    : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <span>💭</span>
              <span>토론 시작</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType("emotion")}
              className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                postType === "emotion"
                  ? "text-black"
                  : "text-gray-300 hover:text-white"
              }`}
              style={{
                backgroundColor:
                  postType === "emotion"
                    ? "#CCFF00"
                    : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <span>💙</span>
              <span>감정 기록</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Movie Title */}
          <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 shadow-sm">
            <label className="block text-lg font-bold text-white mb-3">
              {postType === "emotion" ? "영화 제목" : "영화/드라마 제목"}
            </label>
            <input
              type="text"
              value={movieTitle}
              onChange={(e) => setMovieTitle(e.target.value)}
              className="w-full p-4 border border-white/20 rounded-xl 
                         text-white placeholder-gray-400 focus:outline-none 
                         focus:bg-white/15"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              placeholder="영화 또는 드라마 제목을 입력하세요"
              required
            />
          </div>

          {/* Title */}
          <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 shadow-sm">
            <label className="block text-lg font-bold text-white mb-3">
              {postType === "review" && "리뷰 제목"}
              {postType === "discussion" && "토론 주제"}
              {postType === "emotion" && "감정 기록 제목"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 border border-white/20 rounded-xl 
                         text-white placeholder-gray-400 focus:outline-none 
                         focus:bg-white/15"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              placeholder={
                postType === "review"
                  ? "리뷰 제목을 입력하세요"
                  : postType === "discussion"
                  ? "토론하고 싶은 주제를 입력하세요"
                  : "감정 기록의 제목을 입력하세요"
              }
              required
            />
          </div>

          {/* Rating (for reviews only) */}
          {postType === "review" && (
            <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 shadow-sm">
              <label className="block text-lg font-bold text-white mb-3">
                평점 <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-4">
                {renderRatingStars()}
                <span className="text-gray-400">({rating}/5)</span>
              </div>
              {rating === 0 && (
                <p className="text-red-400 text-sm mt-2">
                  평점을 선택해주세요.
                </p>
              )}
            </div>
          )}

          {/* Emotion Selection (for emotion posts only) */}
          {postType === "emotion" && (
            <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 shadow-sm">
              <label className="block text-lg font-bold text-white mb-3">
                느낀 감정 <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { emoji: "😭", label: "슬픔" },
                  { emoji: "🔥", label: "흥분" },
                  { emoji: "💖", label: "따뜻함" },
                  { emoji: "😰", label: "불안" },
                  { emoji: "🥺", label: "그리움" },
                  { emoji: "😊", label: "기쁨" },
                  { emoji: "😡", label: "분노" },
                  { emoji: "😨", label: "두려움" },
                ].map((emotionOption) => (
                  <button
                    key={emotionOption.label}
                    type="button"
                    onClick={() => setEmotion(emotionOption.label)}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      emotion === emotionOption.label
                        ? "text-black"
                        : "text-gray-300 hover:text-white"
                    }`}
                    style={{
                      backgroundColor:
                        emotion === emotionOption.label
                          ? "#CCFF00"
                          : "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div className="text-2xl mb-1">{emotionOption.emoji}</div>
                    <div className="text-sm">{emotionOption.label}</div>
                  </button>
                ))}
              </div>

              {!emotion && (
                <p className="text-red-400 text-sm mb-4">
                  감정을 선택해주세요.
                </p>
              )}

              {emotion && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    감정 강도 ({emotionIntensity}/5)
                  </label>
                  {renderEmotionIntensity()}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 shadow-sm">
            <label className="block text-lg font-bold text-white mb-3">
              {postType === "review" && "리뷰 내용"}
              {postType === "discussion" && "토론 내용"}
              {postType === "emotion" && "감정 기록"}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full p-4 border border-white/20 rounded-xl 
                         text-white placeholder-gray-400 focus:outline-none 
                         focus:bg-white/15 resize-none"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              placeholder={
                postType === "review"
                  ? "영화에 대한 솔직한 리뷰를 작성해주세요..."
                  : postType === "discussion"
                  ? "토론하고 싶은 내용을 자세히 적어주세요..."
                  : "영화를 보며 느낀 감정을 자세히 기록해주세요..."
              }
              required
              minLength={10}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              최소 10자 이상 입력해주세요 ({content.length}/10)
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 shadow-sm">
            <label className="block text-lg font-bold text-white mb-3">
              태그 (선택사항)
            </label>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full p-4 border border-white/20 rounded-xl 
                         text-white placeholder-gray-400 focus:outline-none 
                         focus:bg-white/15 mb-4"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              placeholder="태그를 입력하고 Enter를 누르세요 (최대 10개)"
              disabled={tags.length >= 10}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-black px-3 py-1 rounded-full text-sm 
                               flex items-center gap-2"
                    style={{ backgroundColor: "#CCFF00" }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-black/20 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 py-4 px-6 rounded-xl text-white font-bold 
                         transition-all duration-300 disabled:opacity-50"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !title.trim() ||
                !content.trim() ||
                content.length < 10 ||
                (postType === "review" && rating === 0) ||
                (postType === "emotion" && !emotion)
              }
              className="flex-1 py-4 px-6 rounded-xl text-black 
                         font-bold hover:shadow-lg transition-all duration-300 
                         hover:-translate-y-1 border-2 border-transparent 
                         hover:border-white/20 disabled:opacity-50 
                         disabled:hover:translate-y-0"
              style={{
                backgroundColor: "#CCFF00",
                boxShadow: "0 4px 20px rgba(204, 255, 0, 0.3)",
              }}
            >
              {isSubmitting ? "작성 중..." : "작성 완료"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
