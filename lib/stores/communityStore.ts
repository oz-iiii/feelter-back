import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  CommunityPost,
  Comment,
  Cat,
  EmotionRecord,
  CommunityFilters,
} from "../types/community";
import {
  postService,
  commentService,
  catService,
  emotionService,
} from "../services/communityService";
import {
  localPostService,
  localUserStatsService,
} from "../services/localCommunityService";
import { COMMUNITY_CONFIG } from "../config/community";
import { useAuth } from "../../hooks/useAuth";

// 설정에 따라 서비스 선택
const getPostService = () =>
  COMMUNITY_CONFIG.USE_LOCAL_STORAGE ? localPostService : postService;
const getUserStatsService = () =>
  COMMUNITY_CONFIG.USE_LOCAL_STORAGE
    ? localUserStatsService
    : {
        incrementPostCount: async (userId: string, postType: string) => {
          console.log(`Supabase userStats: ${userId} posted ${postType}`);
        },
      };

interface CommunityState {
  // 기존 상태들...
  posts: CommunityPost[];
  currentPost: CommunityPost | null;
  postsLoading: boolean;
  postsError: string | null;
  filters: CommunityFilters;
  hasMorePosts: boolean;
  totalPosts: number;

  comments: Comment[];
  commentsLoading: boolean;
  commentsError: string | null;

  cats: Cat[];
  catsLoading: boolean;
  catsError: string | null;

  emotions: EmotionRecord[];
  emotionsLoading: boolean;
  emotionsError: string | null;

  // 액션들 (Supabase 페이지네이션에 맞게 수정)
  fetchPosts: (reset?: boolean) => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  searchPosts: (filters: CommunityFilters, reset?: boolean) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  addPost: (
    post: Omit<
      CommunityPost,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "authorId"
      | "authorName"
      | "authorAvatar"
    >,
    user: any
  ) => Promise<string>;
  updatePost: (id: string, updates: Partial<CommunityPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  togglePostLike: (postId: string) => Promise<void>;
  incrementPostViews: (postId: string) => Promise<void>;
  setCurrentPost: (post: CommunityPost | null) => void;
  setFilters: (filters: CommunityFilters) => void;

  fetchComments: (postId: string) => Promise<void>;
  addComment: (
    comment: Omit<
      Comment,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "authorId"
      | "authorName"
      | "authorAvatar"
    >
  ) => Promise<string>;
  updateComment: (id: string, updates: Partial<Comment>) => Promise<void>;
  deleteComment: (id: string, postId: string) => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;

  fetchCats: (userId?: string) => Promise<void>;
  addCat: (
    cat: Omit<Cat, "id" | "createdAt" | "updatedAt" | "userId">
  ) => Promise<string>;
  updateCat: (id: string, updates: Partial<Cat>) => Promise<void>;

  fetchEmotions: (userId?: string) => Promise<void>;
  addEmotion: (
    emotion: Omit<EmotionRecord, "id" | "createdAt" | "updatedAt" | "userId">
  ) => Promise<string>;
  updateEmotion: (id: string, updates: Partial<EmotionRecord>) => Promise<void>;
  deleteEmotion: (id: string) => Promise<void>;

  clearErrors: () => void;
}

// 인증 확인 헬퍼 함수 - hooks/useAuth 사용을 위해 스토어 내부에서 처리
const getUserFromAuth = () => {
  // 이 함수는 스토어 액션 내에서 현재 유저를 확인하기 위해 사용
  // 실제 인증 확인은 컴포넌트 레벨에서 useAuth를 통해 수행
  return null; // 임시값, 실제로는 액션 파라미터로 user를 받음
};

export const useCommunityStore = create<CommunityState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      posts: [],
      currentPost: null,
      postsLoading: false,
      postsError: null,
      filters: {},
      hasMorePosts: true,
      totalPosts: 0,

      comments: [],
      commentsLoading: false,
      commentsError: null,

      cats: [],
      catsLoading: false,
      catsError: null,

      emotions: [],
      emotionsLoading: false,
      emotionsError: null,

      // 게시글 관련 액션들 (Supabase 페이지네이션 적용)
      fetchPosts: async (reset = true) => {
        set({ postsLoading: true, postsError: null });
        try {
          const pageSize = 20;
          const offset = reset ? 0 : get().posts.length;

          const { posts, hasMore, total } = await getPostService().getAllPosts(
            pageSize,
            offset
          );

          if (reset) {
            set({
              posts,
              hasMorePosts: hasMore,
              totalPosts: total,
              postsLoading: false,
            });
          } else {
            set((state) => ({
              posts: [...state.posts, ...posts],
              hasMorePosts: hasMore,
              totalPosts: total,
              postsLoading: false,
            }));
          }
        } catch (error) {
          set({
            postsError:
              error instanceof Error
                ? error.message
                : "게시글을 불러오는데 실패했습니다.",
            postsLoading: false,
          });
        }
      },

      fetchPostById: async (id: string) => {
        set({ postsLoading: true, postsError: null });
        try {
          const post = await getPostService().getPostById(id);
          set({ currentPost: post, postsLoading: false });
        } catch (error) {
          set({
            postsError:
              error instanceof Error
                ? error.message
                : "게시글을 불러오는데 실패했습니다.",
            postsLoading: false,
          });
        }
      },

      searchPosts: async (filters: CommunityFilters, reset = true) => {
        set({ postsLoading: true, postsError: null, filters });
        try {
          const pageSize = 20;
          const offset = reset ? 0 : get().posts.length;

          const { posts, hasMore, total } =
            await getPostService().getFilteredPosts(filters, pageSize, offset);

          if (reset) {
            set({
              posts,
              hasMorePosts: hasMore,
              totalPosts: total,
              postsLoading: false,
            });
          } else {
            set((state) => ({
              posts: [...state.posts, ...posts],
              hasMorePosts: hasMore,
              totalPosts: total,
              postsLoading: false,
            }));
          }
        } catch (error) {
          set({
            postsError:
              error instanceof Error ? error.message : "검색에 실패했습니다.",
            postsLoading: false,
          });
        }
      },

      loadMorePosts: async () => {
        const { hasMorePosts, filters } = get();
        if (!hasMorePosts) return;

        set({ postsLoading: true });
        try {
          const pageSize = 20;
          const offset = get().posts.length;

          const { posts, hasMore, total } =
            Object.keys(filters).length > 0
              ? await getPostService().getFilteredPosts(
                  filters,
                  pageSize,
                  offset
                )
              : await getPostService().getAllPosts(pageSize, offset);

          set((state) => ({
            posts: [...state.posts, ...posts],
            hasMorePosts: hasMore,
            totalPosts: total,
            postsLoading: false,
          }));
        } catch (error) {
          set({
            postsError:
              error instanceof Error
                ? error.message
                : "더 많은 게시글을 불러오는데 실패했습니다.",
            postsLoading: false,
          });
        }
      },

      addPost: async (postData, user) => {
        try {
          if (!user) {
            throw new Error("로그인이 필요한 기능입니다.");
          }

          const post = {
            ...postData,
            authorId: user.id,
            authorName: user.nickname || user.email?.split("@")[0] || "사용자",
            authorAvatar: user.profile_image || "",
          };

          const postId = await getPostService().addPost(post);

          // 사용자 통계 업데이트
          const userStatsService = getUserStatsService();
          if (post.type === "review") {
            await userStatsService.incrementPostCount(user.id, "review");
          } else if (post.type === "discussion") {
            await userStatsService.incrementPostCount(user.id, "discussion");
          } else if (post.type === "emotion") {
            await userStatsService.incrementPostCount(user.id, "emotion");
          }

          // 새 게시글을 목록 맨 앞에 추가
          const newPost: CommunityPost = {
            ...post,
            id: postId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            posts: [newPost, ...state.posts],
            totalPosts: state.totalPosts + 1,
          }));

          return postId;
        } catch (error) {
          set({
            postsError:
              error instanceof Error
                ? error.message
                : "게시글 작성에 실패했습니다.",
          });
          throw error;
        }
      },

      updatePost: async (id, updates) => {
        try {
          // 작성자 확인은 컴포넌트 레벨에서 수행
          const currentPost =
            get().posts.find((p) => p.id === id) || get().currentPost;
          // if (currentPost && currentPost.authorId !== user.uid) {
          //   throw new Error("본인의 게시글만 수정할 수 있습니다.");
          // }

          await getPostService().updatePost(id, updates);

          set((state) => ({
            posts: state.posts.map((post) =>
              post.id === id
                ? { ...post, ...updates, updatedAt: new Date() }
                : post
            ),
            currentPost:
              state.currentPost?.id === id
                ? { ...state.currentPost, ...updates, updatedAt: new Date() }
                : state.currentPost,
          }));
        } catch (error) {
          set({
            postsError:
              error instanceof Error
                ? error.message
                : "게시글 수정에 실패했습니다.",
          });
          throw error;
        }
      },

      deletePost: async (id) => {
        try {
          // 작성자 확인은 컴포넌트 레벨에서 수행
          const currentPost =
            get().posts.find((p) => p.id === id) || get().currentPost;
          // if (currentPost && currentPost.authorId !== user.uid) {
          //   throw new Error("본인의 게시글만 삭제할 수 있습니다.");
          // }

          await getPostService().deletePost(id);

          set((state) => ({
            posts: state.posts.filter((post) => post.id !== id),
            currentPost:
              state.currentPost?.id === id ? null : state.currentPost,
            totalPosts: Math.max(0, state.totalPosts - 1),
          }));
        } catch (error) {
          set({
            postsError:
              error instanceof Error
                ? error.message
                : "게시글 삭제에 실패했습니다.",
          });
          throw error;
        }
      },

      togglePostLike: async (postId) => {
        try {
          // 좋아요 기능은 기본 기능으로 남겨두되, 사용자 ID는 별도 전달받도록 수정 예정
          console.log(
            "좋아요 기능은 사용자 인증이 완전히 연동된 후 활성화됩니다."
          );
        } catch (error) {
          set({
            postsError:
              error instanceof Error
                ? error.message
                : "좋아요 처리에 실패했습니다.",
          });
          throw error;
        }
      },

      incrementPostViews: async (postId) => {
        try {
          await getPostService().incrementViews(postId);

          set((state) => ({
            posts: state.posts.map((post) =>
              post.id === postId ? { ...post, views: post.views + 1 } : post
            ),
            currentPost:
              state.currentPost?.id === postId
                ? { ...state.currentPost, views: state.currentPost.views + 1 }
                : state.currentPost,
          }));
        } catch (error) {
          // 조회수 증가 실패는 조용히 처리
          console.error("Failed to increment views:", error);
        }
      },

      setCurrentPost: (post) => {
        set({ currentPost: post });
      },

      setFilters: (filters) => {
        set({ filters });
      },

      // 댓글 관련 액션들
      fetchComments: async (postId) => {
        set({ commentsLoading: true, commentsError: null });
        try {
          const comments = await commentService.getCommentsByPostId(postId);
          set({ comments, commentsLoading: false });
        } catch (error) {
          set({
            commentsError:
              error instanceof Error
                ? error.message
                : "댓글을 불러오는데 실패했습니다.",
            commentsLoading: false,
          });
        }
      },

      addComment: async (commentData) => {
        try {
          // 댓글 기능은 추후 구현
          console.log("댓글 기능은 추후 구현 예정입니다.");
          throw new Error("댓글 기능은 추후 구현 예정입니다.");
        } catch (error) {
          set({
            commentsError:
              error instanceof Error
                ? error.message
                : "댓글 작성에 실패했습니다.",
          });
          throw error;
        }
      },

      updateComment: async (id, updates) => {
        try {
          // 댓글 기능은 추후 구현
          console.log("댓글 기능은 추후 구현 예정입니다.");
          throw new Error("댓글 기능은 추후 구현 예정입니다.");
        } catch (error) {
          set({
            commentsError:
              error instanceof Error
                ? error.message
                : "댓글 수정에 실패했습니다.",
          });
          throw error;
        }
      },

      deleteComment: async (id, postId) => {
        try {
          // 댓글 기능은 추후 구현
          console.log("댓글 기능은 추후 구현 예정입니다.");
          throw new Error("댓글 기능은 추후 구현 예정입니다.");
        } catch (error) {
          set({
            commentsError:
              error instanceof Error
                ? error.message
                : "댓글 삭제에 실패했습니다.",
          });
          throw error;
        }
      },

      toggleCommentLike: async (commentId) => {
        try {
          // 댓글 기능은 추후 구현
          console.log("댓글 기능은 추후 구현 예정입니다.");
        } catch (error) {
          set({
            commentsError:
              error instanceof Error
                ? error.message
                : "댓글 좋아요 처리에 실패했습니다.",
          });
        }
      },

      // 고양이 관련 액션들
      fetchCats: async (userId) => {
        try {
          // 고양이 기능은 추후 구현
          console.log("고양이 기능은 추후 구현 예정입니다.");
          set({ catsLoading: false, catsError: null, cats: [] });
        } catch (error) {
          set({
            catsError:
              error instanceof Error
                ? error.message
                : "고양이 정보를 불러오는데 실패했습니다.",
            catsLoading: false,
          });
        }
      },

      addCat: async (catData) => {
        try {
          // 고양이 기능은 추후 구현
          console.log("고양이 기능은 추후 구현 예정입니다.");
          throw new Error("고양이 기능은 추후 구현 예정입니다.");
        } catch (error) {
          set({
            catsError:
              error instanceof Error
                ? error.message
                : "고양이 추가에 실패했습니다.",
          });
          throw error;
        }
      },

      updateCat: async (id, updates) => {
        try {
          // 고양이 기능은 추후 구현
          console.log("고양이 기능은 추후 구현 예정입니다.");
        } catch (error) {
          set({
            catsError:
              error instanceof Error
                ? error.message
                : "고양이 정보 수정에 실패했습니다.",
          });
          throw error;
        }
      },

      // 감정 기록 관련 액션들
      fetchEmotions: async (userId) => {
        try {
          // 감정 기록 기능은 추후 구현
          console.log("감정 기록 기능은 추후 구현 예정입니다.");
          set({ emotionsLoading: false, emotionsError: null, emotions: [] });
        } catch (error) {
          set({
            emotionsError:
              error instanceof Error
                ? error.message
                : "감정 기록을 불러오는데 실패했습니다.",
            emotionsLoading: false,
          });
        }
      },

      addEmotion: async (emotionData) => {
        try {
          // 감정 기록 기능은 추후 구현
          console.log("감정 기록 기능은 추후 구현 예정입니다.");
          throw new Error("감정 기록 기능은 추후 구현 예정입니다.");
        } catch (error) {
          set({
            emotionsError:
              error instanceof Error
                ? error.message
                : "감정 기록 추가에 실패했습니다.",
          });
          throw error;
        }
      },

      updateEmotion: async (id, updates) => {
        try {
          // 감정 기록 기능은 추후 구현
          console.log("감정 기록 기능은 추후 구현 예정입니다.");
        } catch (error) {
          set({
            emotionsError:
              error instanceof Error
                ? error.message
                : "감정 기록 수정에 실패했습니다.",
          });
          throw error;
        }
      },

      deleteEmotion: async (id) => {
        try {
          // 감정 기록 기능은 추후 구현
          console.log("감정 기록 기능은 추후 구현 예정입니다.");
        } catch (error) {
          set({
            emotionsError:
              error instanceof Error
                ? error.message
                : "감정 기록 삭제에 실패했습니다.",
          });
          throw error;
        }
      },

      // 유틸리티
      clearErrors: () => {
        set({
          postsError: null,
          commentsError: null,
          catsError: null,
          emotionsError: null,
        });
      },
    }),
    {
      name: "community-store",
    }
  )
);
