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

export type Database1 = {
  public: {
    Tables: {
      contents: {
        Row: {
          contentsid: number;
          title: string;
          release: Date;
          age: string;
          genres: string[];
          runningtime: string;
          countries: string[];
          directors: string[];
          actors: string[];
          overview: string;
          netizenRating: string;
          imgUrl: string;
          bgUrl: string;
          youtubeUrl: string;
          platform: { name: string; url: string }[];
          upload: Date;
        };
        Insert: {
          contentsid: number;
          title: string;
          release: Date;
          age: string;
          genres: string[];
          runningtime: string;
          countries: string[];
          directors?: string[];
          actors: string[];
          overview: string;
          netizenRating: string;
          imgUrl: string;
          bgUrl: string;
          youtubeUrl: string;
          platform: { name: string; url: string }[];
          upload: Date;
        };
        Update: {
          contentsid?: number;
          title?: string;
          release?: Date;
          age?: string;
          genres?: string[];
          runningtime?: string;
          countries?: string[];
          directors?: string[];
          actors: string[];
          overview?: string;
          netizenRating?: string;
          imgUrl?: string;
          bgUrl?: string;
          youtubeUrl?: string;
          platform?: { name: string; url: string }[];
          upload?: Date;
          update: Date;
        };
      };
      feelterTPO: {
        Row: {
          feelterid: number;
          contentsid: number;
          feelterTime: string;
          feelterPurpose: string;
          feelterOccasion: string;
        };
        Insert: {
          feelterid: number;
          contentsid: number;
          feelterTime: string;
          feelterPurpose: string;
          feelterOccasion: string;
        };
        Update: {
          feelterid: number;
          contentsid?: number;
          feelterTime?: string;
          feelterPurpose?: string;
          feelterOccasion?: string;
        };
      };
    };
  };
};
