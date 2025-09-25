"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityStore } from "@/lib/stores/communityStore";
import { CommunityPost } from "@/lib/types/community";
import ActivityCard, { ActivityCardProps } from "./ActivityCard";
import EditPostModal from "./EditPostModal";

interface FeedTabProps {
  onCreatePost: () => void;
}

const mockFeedData: ActivityCardProps[] = [
  {
    type: "review",
    avatar: "🎬",
    username: "시네마러버님이 15분 전에",
    timestamp: "리뷰를 작성했습니다",
    activityType: "리뷰",
    title: "오펜하이머",
    rating: 4,
    preview:
      "놀란 감독의 또 다른 걸작. 역사적 인물을 다룬 작품 중에서 가장 인상 깊었습니다. 특히 시각적 연출과 사운드 디자인이 정말 압도적이었어요...",
    likes: 24,
    comments: 8,
    tags: ["크리스토퍼놀란", "역사", "전기영화"],
  },
  {
    type: "discussion",
    avatar: "💭",
    username: "드라마퀸님이 32분 전에",
    timestamp: "토론을 시작했습니다",
    activityType: "토론",
    title: "더 글로리 시즌2에 대한 여러분의 생각은?",
    preview:
      "시즌1보다 더 강렬했던 것 같은데, 복수의 완성도 측면에서 어떻게 생각하시나요? 특히 마지막 에피소드가 정말 인상적이었습니다...",
    likes: 12,
    comments: 15,
    tags: ["더글로리", "K드라마", "복수극"],
  },
  {
    type: "cat",
    avatar: "🐱",
    username: "고양이집사님의 고양이가",
    timestamp: "1시간 전에 레벨업했습니다!",
    activityType: "성장",
    title: "🎉 나비가 Lv.7 영화평론가로 성장했어요!",
    preview:
      "꾸준한 리뷰 작성으로 나비가 한 단계 성장했습니다. 이제 더 깊이 있는 영화 분석이 가능해졌어요!",
    likes: 18,
    comments: 5,
    tags: ["고양이성장", "영화평론가", "레벨업"],
  },
  {
    type: "emotion",
    avatar: "💙",
    username: "감성충만님이 2시간 전에",
    timestamp: "감정을 기록했습니다",
    activityType: "감정",
    title: "라라랜드",
    preview:
      "😭 슬픔 | 마지막 장면에서 정말 많이 울었어요. 사랑과 꿈 사이의 선택이라는 주제가 너무 현실적이고 아프게 다가왔습니다...",
    likes: 9,
    comments: 3,
    tags: ["라라랜드", "뮤지컬", "감동"],
  },
];

// 커뮤니티 포스트를 ActivityCard Props로 변환하는 함수
const convertPostToActivityCard = (
  post: CommunityPost,
  currentUserId?: string,
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void
): ActivityCardProps => {
  let avatar = "📝";
  let activityType = "글";

  switch (post.type) {
    case "review":
      avatar = "⭐";
      activityType = "리뷰";
      break;
    case "discussion":
      avatar = "💭";
      activityType = "토론";
      break;
    case "emotion":
      avatar = post.emotionEmoji || "💙";
      activityType = "감정";
      break;
  }

  const timeAgo = getTimeAgo(post.createdAt);

  return {
    id: post.id, // ID 추가
    type:
      post.type === "emotion"
        ? "emotion"
        : post.type === "review"
        ? "review"
        : "discussion",
    avatar,
    username: `${post.authorName}님이 ${timeAgo}에`,
    timestamp: `${activityType}를 작성했습니다`,
    activityType,
    title: post.movieTitle || post.title,
    rating: post.type === "review" ? post.rating : undefined, // 리뷰가 아닌 경우 평점 표시하지 않음
    preview:
      post.content.length > 100
        ? `${post.content.substring(0, 100)}...`
        : post.content,
    likes: post.likes,
    comments: post.comments,
    tags: post.tags,
    authorId: post.authorId,
    currentUserId,
    onEdit,
    onDelete,
  };
};

// 시간 계산 함수
const getTimeAgo = (date: Date | string): string => {
  const now = new Date();
  // date가 문자열이면 Date 객체로 변환
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Date 객체가 유효한지 확인
  if (isNaN(dateObj.getTime())) {
    return "알 수 없음";
  }

  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "방금";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  return `${diffInDays}일 전`;
};

export default function FeedTab({ onCreatePost }: FeedTabProps) {
  const { user } = useAuth();
  const {
    posts,
    postsLoading,
    postsError,
    hasMorePosts,
    fetchPosts,
    loadMorePosts,
    updatePost,
    deletePost,
  } = useCommunityStore();

  const [feedData, setFeedData] = useState<ActivityCardProps[]>([]);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 컴포넌트 마운트 시 게시글 가져오기
  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  // posts가 변경될 때 feedData 업데이트 (감정 게시글 제외)
  useEffect(() => {
    if (posts.length > 0) {
      let filteredPosts = posts;

      // 감정 게시글은 개인 전용이므로 피드에서 제외
      filteredPosts = filteredPosts.filter((post) => post.type !== "emotion");

      // 최신순 정렬 적용
      filteredPosts.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      const activityData = filteredPosts.map((post) =>
        convertPostToActivityCard(
          post,
          user?.id,
          handleEditPost,
          handleDeletePost
        )
      );
      setFeedData(activityData);
    } else {
      // posts가 비어있을 때 mock 데이터 사용 (처음 로드 시)
      setFeedData(mockFeedData);
    }
  }, [posts, user]);

  const loadMoreContent = async () => {
    if (!postsLoading && hasMorePosts) {
      await loadMorePosts();
    }
  };

  const handleEditPost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPost(post);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async (
    postId: string,
    updates: Partial<CommunityPost>
  ) => {
    await updatePost(postId, updates);
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        await deletePost(postId);
        console.log("게시글 삭제 완료:", postId);
      } catch (error) {
        console.error("게시글 삭제 실패:", error);
        alert("게시글 삭제에 실패했습니다.");
      }
    }
  };

  // Infinite scroll handler with throttling
  useEffect(() => {
    let isLoading = false;
    let lastScrollTime = 0;
    const THROTTLE_DELAY = 300; // 300ms throttle

    const handleScroll = () => {
      const now = Date.now();

      // Throttling: 마지막 스크롤 이벤트로부터 300ms가 지나지 않았으면 무시
      if (now - lastScrollTime < THROTTLE_DELAY) {
        return;
      }
      lastScrollTime = now;

      // 이미 로딩 중이거나 더 이상 가져올 데이터가 없으면 중단
      if (isLoading || postsLoading || !hasMorePosts) {
        return;
      }

      // 스크롤이 페이지 하단 근처에 도달했는지 확인
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200
      ) {
        isLoading = true;
        loadMoreContent().finally(() => {
          isLoading = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [postsLoading, hasMorePosts]);

  return (
    <div className="w-full">
      {/* Create Post Button */}
      <button
        onClick={onCreatePost}
        className="w-full mb-8 py-4 px-6 rounded-xl text-black 
                   font-bold text-lg hover:shadow-lg transition-all duration-300 
                   hover:-translate-y-1 border-2 border-transparent hover:border-white/20"
        style={{
          backgroundColor: "#CCFF00",
          boxShadow: "0 4px 20px rgba(204, 255, 0, 0.3)",
        }}
      >
        ✨ 새 글 작성하기
      </button>

      {/* Feed Cards */}
      <div className="space-y-6">
        {feedData.map((item, index) => (
          <ActivityCard key={index} {...item} />
        ))}
      </div>

      {/* Error Message */}
      {postsError && (
        <div className="bg-red-600/20 border border-red-600 rounded-xl p-4 mb-6">
          <p className="text-red-400">{postsError}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {postsLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-white/10 shadow-sm">
            <div
              className="animate-spin w-8 h-8 border-2 border-t-transparent 
                        rounded-full mx-auto mb-3"
              style={{
                borderColor: "#CCFF00",
                borderTopColor: "transparent",
              }}
            ></div>
            <p style={{ color: "#CCFF00" }}>콘텐츠를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {feedData.length === 0 && !postsLoading && !postsError && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: "#CCFF00" }}>
            표시할 피드가 없습니다
          </h3>
          <p className="text-gray-400 mb-6">새 글을 작성해보세요.</p>
          <button
            onClick={onCreatePost}
            className="px-6 py-3 rounded-lg font-medium hover:shadow-lg 
                       transition-all duration-300 border-2 border-transparent 
                       hover:border-white/20"
            style={{
              backgroundColor: "#CCFF00",
              color: "#111111",
              boxShadow: "0 4px 20px rgba(204, 255, 0, 0.3)",
            }}
          >
            첫 번째 글 작성하기
          </button>
        </div>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        post={editingPost}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
