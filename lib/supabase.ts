import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key are required. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only admin client (bypasses RLS). Do NOT expose the key to the client.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export type Database = {
  public: {
    Tables: {
      movies: {
        Row: {
          id: string;
          tmdbid: number;
          title: string;
          release: string;
          age: string;
          genre: string;
          runningTime: string;
          country: string;
          director: string;
          actor: string;
          overview: string;
          streaming: string;
          streamingUrl: string;
          youtubeUrl: string;
          imgUrl: string;
          bgUrl: string;
          feelterTime: string;
          feelterPurpose: string;
          feelterOccasion: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          tmdbid: number;
          title: string;
          release: string;
          age: string;
          genre: string;
          runningTime: string;
          country: string;
          director: string;
          actor: string;
          overview: string;
          streaming: string;
          streamingUrl: string;
          youtubeUrl: string;
          imgUrl: string;
          bgUrl: string;
          feelterTime: string;
          feelterPurpose: string;
          feelterOccasion: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          tmdbid?: number;
          title?: string;
          release?: string;
          age?: string;
          genre?: string;
          runningTime?: string;
          country?: string;
          director?: string;
          actor?: string;
          overview?: string;
          streaming?: string;
          streamingUrl?: string;
          youtubeUrl?: string;
          imgUrl?: string;
          bgUrl?: string;
          feelterTime?: string;
          feelterPurpose?: string;
          feelterOccasion?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      rankings: {
        Row: {
          id: string;
          rank: number;
          movieId: string;
          bestComment: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          rank: number;
          movieId: string;
          bestComment: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          rank?: number;
          movieId?: string;
          bestComment?: string;
          createdAt?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          type: "review" | "discussion" | "emotion" | "general";
          author_id: string;
          author_name: string;
          author_avatar: string | null;
          title: string;
          content: string;
          movie_title: string | null;
          rating: number | null;
          emotion: string | null;
          emotion_emoji: string | null;
          emotion_intensity: number | null;
          tags: string[];
          likes: number;
          liked_by: string[];
          comments: number;
          views: number;
          is_active: boolean;
          status: "hot" | "new" | "solved";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: "review" | "discussion" | "emotion" | "general";
          author_id: string;
          author_name: string;
          author_avatar?: string | null;
          title: string;
          content: string;
          movie_title?: string | null;
          rating?: number | null;
          emotion?: string | null;
          emotion_emoji?: string | null;
          emotion_intensity?: number | null;
          tags?: string[];
          likes?: number;
          liked_by?: string[];
          comments?: number;
          views?: number;
          is_active?: boolean;
          status?: "hot" | "new" | "solved";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: "review" | "discussion" | "emotion" | "general";
          author_id?: string;
          author_name?: string;
          author_avatar?: string | null;
          title?: string;
          content?: string;
          movie_title?: string | null;
          rating?: number | null;
          emotion?: string | null;
          emotion_emoji?: string | null;
          emotion_intensity?: number | null;
          tags?: string[];
          likes?: number;
          liked_by?: string[];
          comments?: number;
          views?: number;
          is_active?: boolean;
          status?: "hot" | "new" | "solved";
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          author_name: string;
          author_avatar: string | null;
          content: string;
          likes: number;
          liked_by: string[];
          parent_comment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          author_name: string;
          author_avatar?: string | null;
          content: string;
          likes?: number;
          liked_by?: string[];
          parent_comment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          author_name?: string;
          author_avatar?: string | null;
          content?: string;
          likes?: number;
          liked_by?: string[];
          parent_comment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          nickname: string | null;
          photo_url: string | null;
          bio: string | null;
          favorite_genres: string[];
          favorite_actors: string[];
          favorite_directors: string[];
          stats: any;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          nickname?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          favorite_genres?: string[];
          favorite_actors?: string[];
          favorite_directors?: string[];
          stats?: any;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          nickname?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          favorite_genres?: string[];
          favorite_actors?: string[];
          favorite_directors?: string[];
          stats?: any;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      cats: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string;
          level: number;
          type: string;
          experience: number;
          max_experience: number;
          description: string | null;
          specialty: string | null;
          achievements: string[];
          stats: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji: string;
          level?: number;
          type: string;
          experience?: number;
          max_experience?: number;
          description?: string | null;
          specialty?: string | null;
          achievements?: string[];
          stats?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string;
          level?: number;
          type?: string;
          experience?: number;
          max_experience?: number;
          description?: string | null;
          specialty?: string | null;
          achievements?: string[];
          stats?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      emotions: {
        Row: {
          id: string;
          user_id: string;
          movie_title: string;
          emotion: string;
          emoji: string;
          text: string;
          intensity: number;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_title: string;
          emotion: string;
          emoji: string;
          text: string;
          intensity: number;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          movie_title?: string;
          emotion?: string;
          emoji?: string;
          text?: string;
          intensity?: number;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
