import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 Supabase URL과 키를 가져옵니다. (필수)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

// 단일 확정 클라이언트 인스턴스
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
