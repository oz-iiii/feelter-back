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
    };
  };
};
