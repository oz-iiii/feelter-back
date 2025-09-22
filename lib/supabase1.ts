import { createClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_ 접두사가 붙은 환경 변수는 클라이언트와 서버 모두에서 접근 가능합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Role Key are required. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 이 키는 서버에서만 사용해야 하며, 클라이언트에 노출되면 안 됩니다.
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
          release: string;
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
          ottplatforms: { name: string; url: string }[];
          bestcoment: string;
          upload: string;
          update: string;
        };
        Insert: {
          contentsid: number;
          title: string;
          release: string;
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
          ottplatforms: { name: string; url: string }[];
          bestcoment: string;
          upload: string;
          update: string;
        };
        Update: {
          contentsid?: number;
          title?: string;
          release?: string;
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
          ottplatforms?: { name: string; url: string }[];
          bestcoment: string;
          upload?: string;
          update: string;
        };
      };
      feelterTPO: {
        Row: {
          feelterid: number;
          contentsid: number;
          feelterTime: string[];
          feelterPurpose: string[];
          feelterOccasion: string[];
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          feelterid?: number;
          contentsid: number;
          feelterTime: string[];
          feelterPurpose: string[];
          feelterOccasion: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          feelterid?: number;
          contentsid?: number;
          feelterTime?: string[];
          feelterPurpose?: string[];
          feelterOccasion?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
