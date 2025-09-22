import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .order("release", { ascending: false });

    if (error) {
      console.error("Contents 가져오기 실패:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("API 에러:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "콘텐츠를 가져오는데 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
