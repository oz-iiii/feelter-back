// 로컬 스토리지를 사용한 임시 커뮤니티 서비스
import { CommunityPost, Comment, CommunityFilters } from "../types/community";

// 로컬 스토리지 키
const POSTS_STORAGE_KEY = "feelter_community_posts";
const COMMENTS_STORAGE_KEY = "feelter_community_comments";

// 로컬 스토리지 헬퍼 함수들
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    const parsed = JSON.parse(item);

    // CommunityPost 배열인 경우 Date 객체 복원
    if (key === POSTS_STORAGE_KEY && Array.isArray(parsed)) {
      return parsed.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      })) as T;
    }

    return parsed;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
};

// 게시글 관련 서비스 (로컬 버전)
export const localPostService = {
  // 모든 게시글 가져오기
  async getAllPosts(
    pageSize: number = 20,
    offset: number = 0
  ): Promise<{
    posts: CommunityPost[];
    hasMore: boolean;
    total: number;
  }> {
    try {
      const allPosts = getFromLocalStorage<CommunityPost[]>(
        POSTS_STORAGE_KEY,
        []
      );

      // 날짜순 정렬 (최신순)
      const sortedPosts = allPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const total = sortedPosts.length;
      const posts = sortedPosts.slice(offset, offset + pageSize);
      const hasMore = offset + pageSize < total;

      return { posts, hasMore, total };
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw new Error("게시글을 불러오는데 실패했습니다.");
    }
  },

  // 필터링된 게시글 가져오기
  async getFilteredPosts(
    filters: CommunityFilters,
    pageSize: number = 20,
    offset: number = 0
  ): Promise<{
    posts: CommunityPost[];
    hasMore: boolean;
    total: number;
  }> {
    try {
      let allPosts = getFromLocalStorage<CommunityPost[]>(
        POSTS_STORAGE_KEY,
        []
      );

      // 필터 적용
      if (filters.type) {
        allPosts = allPosts.filter((post) => post.type === filters.type);
      }

      if (filters.status) {
        allPosts = allPosts.filter((post) => post.status === filters.status);
      }

      if (filters.authorId) {
        allPosts = allPosts.filter(
          (post) => post.authorId === filters.authorId
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        allPosts = allPosts.filter((post) =>
          filters.tags!.some((tag) => post.tags.includes(tag))
        );
      }

      // 정렬
      const sortBy = filters.sortBy || "createdAt";
      const sortOrder = filters.sortOrder || "desc";

      allPosts.sort((a, b) => {
        let aValue: any = a[sortBy as keyof CommunityPost];
        let bValue: any = b[sortBy as keyof CommunityPost];

        if (sortBy === "createdAt" || sortBy === "updatedAt") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      const total = allPosts.length;
      const posts = allPosts.slice(offset, offset + pageSize);
      const hasMore = offset + pageSize < total;

      return { posts, hasMore, total };
    } catch (error) {
      console.error("Error filtering posts:", error);
      throw new Error("게시글 검색에 실패했습니다.");
    }
  },

  // 게시글 ID로 가져오기
  async getPostById(id: string): Promise<CommunityPost | null> {
    try {
      const allPosts = getFromLocalStorage<CommunityPost[]>(
        POSTS_STORAGE_KEY,
        []
      );
      return allPosts.find((post) => post.id === id) || null;
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      throw new Error("게시글을 불러오는데 실패했습니다.");
    }
  },

  // 게시글 추가
  async addPost(
    post: Omit<CommunityPost, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const allPosts = getFromLocalStorage<CommunityPost[]>(
        POSTS_STORAGE_KEY,
        []
      );

      const newPost: CommunityPost = {
        ...post,
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      allPosts.unshift(newPost); // 맨 앞에 추가
      saveToLocalStorage(POSTS_STORAGE_KEY, allPosts);

      return newPost.id;
    } catch (error) {
      console.error("Error adding post:", error);
      throw new Error("게시글 작성에 실패했습니다.");
    }
  },

  // 게시글 업데이트
  async updatePost(id: string, updates: Partial<CommunityPost>): Promise<void> {
    try {
      const allPosts = getFromLocalStorage<CommunityPost[]>(
        POSTS_STORAGE_KEY,
        []
      );
      const postIndex = allPosts.findIndex((post) => post.id === id);

      if (postIndex === -1) {
        throw new Error("게시글을 찾을 수 없습니다.");
      }

      allPosts[postIndex] = {
        ...allPosts[postIndex],
        ...updates,
        updatedAt: new Date(),
      };

      saveToLocalStorage(POSTS_STORAGE_KEY, allPosts);
    } catch (error) {
      console.error("Error updating post:", error);
      throw new Error("게시글 수정에 실패했습니다.");
    }
  },

  // 게시글 삭제
  async deletePost(id: string): Promise<void> {
    try {
      const allPosts = getFromLocalStorage<CommunityPost[]>(
        POSTS_STORAGE_KEY,
        []
      );
      const filteredPosts = allPosts.filter((post) => post.id !== id);
      saveToLocalStorage(POSTS_STORAGE_KEY, filteredPosts);
    } catch (error) {
      console.error("Error deleting post:", error);
      throw new Error("게시글 삭제에 실패했습니다.");
    }
  },

  // 좋아요 토글
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const allPosts = getFromLocalStorage<CommunityPost[]>(
        POSTS_STORAGE_KEY,
        []
      );
      const postIndex = allPosts.findIndex((post) => post.id === postId);

      if (postIndex === -1) {
        throw new Error("게시글을 찾을 수 없습니다.");
      }

      const post = allPosts[postIndex];
      const likedBy = post.likedBy || [];
      const isCurrentlyLiked = likedBy.includes(userId);

      if (isCurrentlyLiked) {
        post.likedBy = likedBy.filter((id) => id !== userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likedBy = [...likedBy, userId];
        post.likes = post.likes + 1;
      }

      post.updatedAt = new Date();
      saveToLocalStorage(POSTS_STORAGE_KEY, allPosts);
    } catch (error) {
      console.error("Error toggling like:", error);
      throw new Error("좋아요 처리에 실패했습니다.");
    }
  },

  // 조회수 증가
  async incrementViews(postId: string): Promise<void> {
    try {
      const allPosts = getFromLocalStorage<CommunityPost[]>(
        POSTS_STORAGE_KEY,
        []
      );
      const postIndex = allPosts.findIndex((post) => post.id === postId);

      if (postIndex !== -1) {
        allPosts[postIndex].views += 1;
        allPosts[postIndex].updatedAt = new Date();
        saveToLocalStorage(POSTS_STORAGE_KEY, allPosts);
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
      // 조회수 증가 실패는 조용히 처리
    }
  },
};

// 사용자 통계 서비스 (로컬 버전)
export const localUserStatsService = {
  async incrementPostCount(
    userId: string,
    postType: "review" | "discussion" | "emotion"
  ): Promise<void> {
    // 로컬 버전에서는 단순히 로그만 출력
    console.log(`User ${userId} posted a ${postType}`);
  },

  async incrementLikesReceived(
    userId: string,
    incrementValue: number = 1
  ): Promise<void> {
    console.log(`User ${userId} received ${incrementValue} likes`);
  },

  async incrementCommentsReceived(userId: string): Promise<void> {
    console.log(`User ${userId} received a comment`);
  },
};
