import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "@/lib/supabase";
// Supabase 관리자 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// POST 요청을 처리하는 함수
export async function POST(req) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, error: "관리자 클라이언트가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const seedData = await req.json(); // 요청 본문에서 JSON 데이터 읽기
    console.log("✅ JSON 데이터를 읽고 데이터베이스에 맞게 변환 중...");

    const contentsToInsert = seedData.map((item) => ({
      title: item.title,
      overview: item.overview,
      director: item.director,
      genres: item.genres,
      platforms: item.platforms,
    }));

    // 1단계: contents 테이블에 기본 영화 정보 일괄 삽입
    console.log("✅ 1단계: contents 테이블에 데이터 일괄 업로드 중...");
    const { data: contentsData, error: contentsError } = await supabaseAdmin
      .from("contents")
      .insert(contentsToInsert)
      .select("id, title");

    if (contentsError) {
      console.error("❌ contents 테이블 삽입 오류:", contentsError);
      throw new Error(`contents 테이블 삽입 실패: ${contentsError.message}`);
    }

    // 2단계: feelterTPO 데이터 준비 및 삽입
    console.log("✅ 2단계: feelterTPO 데이터 준비 중...");
    const tpoToInsert = [];
    seedData.forEach((item, index) => {
      const correspondingContent = contentsData.find(
        (c) => c.title === item.title
      );
      if (correspondingContent) {
        tpoToInsert.push({
          contentsid: correspondingContent.id,
          feelterTime: item.feelterTime,
          feelterPurpose: item.feelterPurpose,
          feelterOccasion: item.feelterOccasion,
        });
      }
    });

    if (tpoToInsert.length > 0) {
      const { error: tpoError } = await supabaseAdmin
        .from("feelterTPO")
        .insert(tpoToInsert);

      if (tpoError) {
        console.error("❌ feelterTPO 테이블 삽입 오류:", tpoError);
        throw new Error(`feelterTPO 테이블 삽입 실패: ${tpoError.message}`);
      }
      console.log(`✅ ${tpoToInsert.length}개의 feelterTPO 데이터 입력 완료!`);
    }

    console.log("🎉 모든 데이터베이스 작업 완료!");

    return NextResponse.json({
      success: true,
      message: "모든 데이터가 성공적으로 입력되었습니다.",
      insertedContentsCount: contentsData.length,
      insertedTpoCount: tpoToInsert.length,
    });
  } catch (error) {
    console.error("❌ 데이터 입력 중 오류 발생:", error);
    return NextResponse.json(
      {
        success: false,
        message: "데이터 입력 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

// GET 요청은 업로드 기능을 안내
export async function GET() {
  return NextResponse.json({
    message: "데이터베이스에 데이터를 업로드하려면 POST 요청을 보내세요.",
  });
}
