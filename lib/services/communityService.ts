import { supabase } from "../supabase";
import {
  CommunityPost,
  Comment,
  Cat,
  EmotionRecord,
  CommunityFilters,
} from "../types/community";

// 게시글 관련 서비스
export const postService = {
  // 모든 게시글 가져오기 (페이지네이션 포함)
  async getAllPosts(
    pageSize: number = 20,
    offset: number = 0
  ): Promise<{
    posts: CommunityPost[];
    hasMore: boolean;
    total: number;
  }> {
    try {
      // 전체 개수 가져오기
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });

      // 게시글 데이터 가져오기
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      const posts = data?.map(this.mapPostFromDb) || [];

      return {
        posts,
        hasMore: offset + pageSize < (count || 0),
        total: count || 0,
      };
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
      let query = supabase.from("posts").select("*", { count: "exact" });

      // 필터 적용
      if (filters.type) {
        query = query.eq("type", filters.type);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.authorId) {
        query = query.eq("author_id", filters.authorId);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      // 정렬
      const sortBy = filters.sortBy || "created_at";
      const sortOrder =
        filters.sortOrder === "asc"
          ? { ascending: true }
          : { ascending: false };

      query = query.order(sortBy, sortOrder);

      // 페이지네이션
      const { data, error, count } = await query.range(
        offset,
        offset + pageSize - 1
      );

      if (error) throw error;

      const posts = data?.map(this.mapPostFromDb) || [];

      return {
        posts,
        hasMore: offset + pageSize < (count || 0),
        total: count || 0,
      };
    } catch (error) {
      console.error("Error filtering posts:", error);
      throw new Error("게시글 검색에 실패했습니다.");
    }
  },

  // 게시글 ID로 가져오기
  async getPostById(id: string): Promise<CommunityPost | null> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      return this.mapPostFromDb(data);
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
      const postData = this.mapPostToDb(post);

      const { data, error } = await supabase
        .from("posts")
        .insert([postData])
        .select()
        .single();

      if (error) throw error;

      // 사용자 통계 업데이트
      await userStatsService.incrementPostCount(post.authorId, post.type);

      return data.id;
    } catch (error) {
      console.error("Error adding post:", error);
      throw new Error("게시글 작성에 실패했습니다.");
    }
  },

  // 게시글 업데이트
  async updatePost(id: string, updates: Partial<CommunityPost>): Promise<void> {
    try {
      const updateData = this.mapPostToDb(updates);
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating post:", error);
      throw new Error("게시글 수정에 실패했습니다.");
    }
  },

  // 게시글 삭제
  async deletePost(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw new Error("게시글 삭제에 실패했습니다.");
    }
  },

  // 좋아요 토글
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const { data: currentPost, error: fetchError } = await supabase
        .from("posts")
        .select("likes, liked_by, author_id")
        .eq("id", postId)
        .single();

      if (fetchError) throw fetchError;

      const likedBy = currentPost.liked_by || [];
      const isCurrentlyLiked = likedBy.includes(userId);

      let newLikedBy: string[];
      let newLikes: number;

      if (isCurrentlyLiked) {
        newLikedBy = likedBy.filter((id: string) => id !== userId);
        newLikes = Math.max(0, currentPost.likes - 1);
      } else {
        newLikedBy = [...likedBy, userId];
        newLikes = currentPost.likes + 1;
      }

      const { error: updateError } = await supabase
        .from("posts")
        .update({
          likes: newLikes,
          liked_by: newLikedBy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (updateError) throw updateError;

      // 게시글 작성자의 받은 좋아요 수 업데이트 (본인 제외)
      if (currentPost.author_id !== userId) {
        const incrementValue = isCurrentlyLiked ? -1 : 1;
        await userStatsService.incrementLikesReceived(
          currentPost.author_id,
          incrementValue
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw new Error("좋아요 처리에 실패했습니다.");
    }
  },

  // 조회수 증가
  async incrementViews(postId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("increment_post_views", {
        post_id: postId,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error incrementing views:", error);
      // 조회수 증가 실패는 조용히 처리
    }
  },

  // DB 데이터를 앱 모델로 매핑
  mapPostFromDb(data: any): CommunityPost {
    return {
      id: data.id,
      type: data.type,
      authorId: data.author_id,
      authorName: data.author_name,
      authorAvatar: data.author_avatar || "",
      title: data.title,
      content: data.content,
      movieTitle: data.movie_title,
      rating: data.rating,
      emotion: data.emotion,
      emotionEmoji: data.emotion_emoji,
      emotionIntensity: data.emotion_intensity,
      tags: data.tags || [],
      likes: data.likes,
      likedBy: data.liked_by || [],
      comments: data.comments,
      views: data.views,
      isActive: data.is_active,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  // 앱 모델을 DB 형식으로 매핑
  mapPostToDb(post: any): any {
    return {
      type: post.type,
      author_id: post.authorId,
      author_name: post.authorName,
      author_avatar: post.authorAvatar,
      title: post.title,
      content: post.content,
      movie_title: post.movieTitle,
      rating: post.rating,
      emotion: post.emotion,
      emotion_emoji: post.emotionEmoji,
      emotion_intensity: post.emotionIntensity,
      tags: post.tags || [],
      likes: post.likes || 0,
      liked_by: post.likedBy || [],
      comments: post.comments || 0,
      views: post.views || 0,
      is_active: post.isActive !== false,
      status: post.status || "new",
    };
  },
};

// 사용자 통계 서비스
export const userStatsService = {
  async incrementPostCount(
    userId: string,
    postType: "review" | "discussion" | "emotion"
  ): Promise<void> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("stats")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const stats = user.stats || {};
      stats.postsCount = (stats.postsCount || 0) + 1;

      switch (postType) {
        case "review":
          stats.reviewsCount = (stats.reviewsCount || 0) + 1;
          break;
        case "discussion":
          stats.discussionsCount = (stats.discussionsCount || 0) + 1;
          break;
        case "emotion":
          stats.emotionsCount = (stats.emotionsCount || 0) + 1;
          break;
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ stats })
        .eq("id", userId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error incrementing post count:", error);
    }
  },

  async incrementLikesReceived(
    userId: string,
    incrementValue: number = 1
  ): Promise<void> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("stats")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const stats = user.stats || {};
      stats.likesReceived = Math.max(
        0,
        (stats.likesReceived || 0) + incrementValue
      );

      const { error: updateError } = await supabase
        .from("users")
        .update({ stats })
        .eq("id", userId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error incrementing likes received:", error);
    }
  },

  async incrementCommentsReceived(userId: string): Promise<void> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("stats")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const stats = user.stats || {};
      stats.commentsReceived = (stats.commentsReceived || 0) + 1;

      const { error: updateError } = await supabase
        .from("users")
        .update({ stats })
        .eq("id", userId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error incrementing comments received:", error);
    }
  },
};

// 댓글 관련 서비스
export const commentService = {
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const comments = data?.map(this.mapCommentFromDb) || [];

      // 댓글을 계층구조로 변환
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      comments.forEach((comment) => {
        comment.replies = [];
        commentMap.set(comment.id, comment);

        if (comment.parentCommentId) {
          const parent = commentMap.get(comment.parentCommentId);
          if (parent) {
            parent.replies!.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      return rootComments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error("댓글을 불러오는데 실패했습니다.");
    }
  },

  async addComment(
    comment: Omit<Comment, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const commentData = this.mapCommentToDb(comment);

      const { data, error } = await supabase
        .from("comments")
        .insert([commentData])
        .select()
        .single();

      if (error) throw error;

      // 게시글의 댓글 수 증가
      const { error: updateError } = await supabase.rpc(
        "increment_post_comments",
        { post_id: comment.postId }
      );

      if (updateError) throw updateError;

      return data.id;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw new Error("댓글 작성에 실패했습니다.");
    }
  },

  async updateComment(id: string, updates: Partial<Comment>): Promise<void> {
    try {
      const updateData = this.mapCommentToDb(updates);
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("comments")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw new Error("댓글 수정에 실패했습니다.");
    }
  },

  async deleteComment(id: string, postId: string): Promise<void> {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;

      // 게시글의 댓글 수 감소
      const { error: updateError } = await supabase.rpc(
        "decrement_post_comments",
        { post_id: postId }
      );

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw new Error("댓글 삭제에 실패했습니다.");
    }
  },

  async toggleCommentLike(commentId: string, userId: string): Promise<void> {
    try {
      const { data: currentComment, error: fetchError } = await supabase
        .from("comments")
        .select("likes, liked_by")
        .eq("id", commentId)
        .single();

      if (fetchError) throw fetchError;

      const likedBy = currentComment.liked_by || [];
      const isCurrentlyLiked = likedBy.includes(userId);

      let newLikedBy: string[];
      let newLikes: number;

      if (isCurrentlyLiked) {
        newLikedBy = likedBy.filter((id: string) => id !== userId);
        newLikes = Math.max(0, currentComment.likes - 1);
      } else {
        newLikedBy = [...likedBy, userId];
        newLikes = currentComment.likes + 1;
      }

      const { error: updateError } = await supabase
        .from("comments")
        .update({
          likes: newLikes,
          liked_by: newLikedBy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error toggling comment like:", error);
      throw new Error("댓글 좋아요 처리에 실패했습니다.");
    }
  },

  mapCommentFromDb(data: any): Comment {
    return {
      id: data.id,
      postId: data.post_id,
      authorId: data.author_id,
      authorName: data.author_name,
      authorAvatar: data.author_avatar || "",
      content: data.content,
      likes: data.likes,
      likedBy: data.liked_by || [],
      parentCommentId: data.parent_comment_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  mapCommentToDb(comment: any): any {
    return {
      post_id: comment.postId,
      author_id: comment.authorId,
      author_name: comment.authorName,
      author_avatar: comment.authorAvatar,
      content: comment.content,
      likes: comment.likes || 0,
      liked_by: comment.likedBy || [],
      parent_comment_id: comment.parentCommentId,
    };
  },
};

// 고양이 관련 서비스
export const catService = {
  async getCatsByUserId(userId: string): Promise<Cat[]> {
    try {
      const { data, error } = await supabase
        .from("cats")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      return data?.map(this.mapCatFromDb) || [];
    } catch (error) {
      console.error("Error fetching cats:", error);
      throw new Error("고양이 정보를 불러오는데 실패했습니다.");
    }
  },

  async addCat(
    cat: Omit<Cat, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const catData = this.mapCatToDb(cat);

      const { data, error } = await supabase
        .from("cats")
        .insert([catData])
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error("Error adding cat:", error);
      throw new Error("고양이 추가에 실패했습니다.");
    }
  },

  async updateCat(id: string, updates: Partial<Cat>): Promise<void> {
    try {
      const updateData = this.mapCatToDb(updates);
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("cats")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating cat:", error);
      throw new Error("고양이 정보 수정에 실패했습니다.");
    }
  },

  async addExperience(
    userId: string,
    activityType: "review" | "discussion" | "emotion",
    points: number
  ): Promise<void> {
    try {
      const cats = await this.getCatsByUserId(userId);
      const catTypeMap = {
        review: "영화평론가",
        discussion: "토론왕",
        emotion: "감정표현가",
      };

      const targetCat = cats.find(
        (cat) => cat.type === catTypeMap[activityType]
      );

      if (targetCat) {
        targetCat.experience += points;

        // 레벨업 체크
        while (targetCat.experience >= targetCat.maxExperience) {
          targetCat.experience -= targetCat.maxExperience;
          targetCat.level += 1;
          targetCat.maxExperience = Math.floor(targetCat.maxExperience * 1.5);
        }

        await this.updateCat(targetCat.id, targetCat);
      }
    } catch (error) {
      console.error("Error adding cat experience:", error);
    }
  },

  mapCatFromDb(data: any): Cat {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      emoji: data.emoji,
      level: data.level,
      type: data.type,
      experience: data.experience,
      maxExperience: data.max_experience,
      description: data.description,
      specialty: data.specialty,
      achievements: data.achievements || [],
      stats: data.stats || { reviews: 0, discussions: 0, emotions: 0 },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  mapCatToDb(cat: any): any {
    return {
      user_id: cat.userId,
      name: cat.name,
      emoji: cat.emoji,
      level: cat.level,
      type: cat.type,
      experience: cat.experience,
      max_experience: cat.maxExperience,
      description: cat.description,
      specialty: cat.specialty,
      achievements: cat.achievements || [],
      stats: cat.stats || { reviews: 0, discussions: 0, emotions: 0 },
    };
  },
};

// 감정 기록 관련 서비스
export const emotionService = {
  async getEmotionsByUserId(userId: string): Promise<EmotionRecord[]> {
    try {
      const { data, error } = await supabase
        .from("emotions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data?.map(this.mapEmotionFromDb) || [];
    } catch (error) {
      console.error("Error fetching emotions:", error);
      throw new Error("감정 기록을 불러오는데 실패했습니다.");
    }
  },

  async addEmotionRecord(
    emotion: Omit<EmotionRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const emotionData = this.mapEmotionToDb(emotion);

      const { data, error } = await supabase
        .from("emotions")
        .insert([emotionData])
        .select()
        .single();

      if (error) throw error;

      // 고양이 경험치 추가
      await catService.addExperience(emotion.userId, "emotion", 10);

      return data.id;
    } catch (error) {
      console.error("Error adding emotion record:", error);
      throw new Error("감정 기록 추가에 실패했습니다.");
    }
  },

  async updateEmotionRecord(
    id: string,
    updates: Partial<EmotionRecord>
  ): Promise<void> {
    try {
      const updateData = this.mapEmotionToDb(updates);
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("emotions")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating emotion record:", error);
      throw new Error("감정 기록 수정에 실패했습니다.");
    }
  },

  async deleteEmotionRecord(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("emotions").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting emotion record:", error);
      throw new Error("감정 기록 삭제에 실패했습니다.");
    }
  },

  mapEmotionFromDb(data: any): EmotionRecord {
    return {
      id: data.id,
      userId: data.user_id,
      movieTitle: data.movie_title,
      emotion: data.emotion,
      emoji: data.emoji,
      text: data.text,
      intensity: data.intensity,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  mapEmotionToDb(emotion: any): any {
    return {
      user_id: emotion.userId,
      movie_title: emotion.movieTitle,
      emotion: emotion.emotion,
      emoji: emotion.emoji,
      text: emotion.text,
      intensity: emotion.intensity,
      tags: emotion.tags || [],
    };
  },
};
