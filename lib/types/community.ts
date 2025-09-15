export interface CommunityPost {
  id: string;
  type: "review" | "discussion" | "emotion" | "general";
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  movieTitle?: string; // 영화/드라마 제목 (리뷰, 감정 기록용)
  rating?: number; // 평점 (1-5)
  emotion?: string; // 감정 (감정 기록용)
  emotionEmoji?: string; // 감정 이모지
  emotionIntensity?: number; // 감정 강도 (1-5)
  tags: string[];
  likes: number;
  likedBy: string[]; // 좋아요 누른 사용자 ID 목록
  comments: number;
  views: number;
  isActive?: boolean; // 활발한 토론 여부
  status?: "hot" | "new" | "solved"; // 게시글 상태
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  likedBy: string[];
  parentCommentId?: string; // 대댓글인 경우 부모 댓글 ID
  replies?: Comment[]; // 대댓글 목록
  createdAt: Date;
  updatedAt: Date;
}

export interface Cat {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  level: number;
  type: string; // "영화평론가", "토론왕", "감정표현가"
  experience: number;
  maxExperience: number;
  description: string;
  specialty: string;
  achievements: string[];
  stats: {
    reviews: number;
    discussions: number;
    emotions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmotionRecord {
  id: string;
  userId: string;
  movieTitle: string;
  emotion: string;
  emoji: string;
  text: string;
  intensity: number; // 1-5
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityFilters {
  type?: "review" | "discussion" | "emotion" | "general";
  status?: "hot" | "new" | "solved";
  sortBy?: "createdAt" | "likes" | "comments" | "views" | "rating";
  sortOrder?: "asc" | "desc";
  tags?: string[];
  authorId?: string;
}

// 추가 타입 정의
export interface PostStats {
  totalPosts: number;
  todayPosts: number;
  popularTags: Array<{ tag: string; count: number }>;
  activeUsers: number;
}

export interface UserActivity {
  userId: string;
  userName: string;
  userAvatar: string;
  activityType: "post" | "comment" | "like";
  targetType: "review" | "discussion" | "emotion";
  targetId: string;
  targetTitle: string;
  createdAt: Date;
}

export interface PopularPost extends CommunityPost {
  engagementScore: number; // 좋아요 + 댓글 + 조회수를 기반으로 한 인기도 점수
  trendingTags: string[];
}

export interface CommunityLeaderboard {
  users: Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    stats: {
      totalPosts: number;
      totalLikes: number;
      totalComments: number;
      weeklyActivity: number;
    };
    rank: number;
    badges: string[];
  }>;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: "like" | "comment" | "reply" | "mention" | "follow";
  message: string;
  relatedId?: string; // 관련 게시글이나 댓글 ID
  relatedType?: "post" | "comment";
  isRead: boolean;
  createdAt: Date;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    comments: boolean;
    likes: boolean;
    mentions: boolean;
    follows: boolean;
  };
  privacy: {
    showActivity: boolean;
    showStats: boolean;
    showEmail: boolean;
  };
  display: {
    theme: "light" | "dark" | "auto";
    language: "ko" | "en";
    postsPerPage: number;
  };
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 폼 관련 타입
export interface CreatePostForm {
  type: "review" | "discussion" | "emotion";
  title: string;
  content: string;
  movieTitle: string;
  rating?: number;
  emotion?: string;
  emotionIntensity?: number;
  tags: string[];
}

export interface CreateCommentForm {
  content: string;
  parentCommentId?: string;
}

export interface UpdatePostForm extends Partial<CreatePostForm> {
  id: string;
}

// 검색 관련 타입
export interface SearchFilters extends CommunityFilters {
  query?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minLikes?: number;
  minComments?: number;
}

export interface SearchResult {
  posts: CommunityPost[];
  users: Array<{
    id: string;
    name: string;
    avatar: string;
    postsCount: number;
  }>;
  tags: string[];
  total: number;
}
