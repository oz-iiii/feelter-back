import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase1";

// converted_data.JSON 파일에서 데이터 직접 임포트
import convertedData from "./converted_data.json";

// 데이터 타입 정의
interface ConvertedContent {
  contentsid: number;
  title: string;
  release?: string;
  age: string;
  genres: string[];
  runningtime: string;
  countries: string[];
  directors?: string[];
  actors?: string[];
  overview: string;
  netizenRating?: string;
  imgUrl: string;
  bgUrl?: string;
  youtubeUrl: string;
  ottplatforms: { name: string; url: string }[];
  feelterTime: string[];
  feelterPurpose: string[];
  feelterOccasion: string[];
  bestcoment?: string;
  upload?: string;
  update?: string;
}

// JSON 추론 타입 보정
const converted: ConvertedContent[] =
  convertedData as unknown as ConvertedContent[];

// POST 요청을 처리하는 함수
export async function POST() {
  try {
    const client = supabaseAdmin ?? supabase;

    console.log(
      "✅ 1단계: `contents` 테이블에 데이터 일괄 업로드(upsert) 중..."
    );

    const contentsToInsert = converted.map((item) => ({
      contentsid: item.contentsid,
      title: item.title,
      release: item.release ?? "", // release 필드에 null 및 undefined 값 처리 로직 추가
      age: item.age,
      genres: item.genres ?? [],
      runningtime: item.runningtime ?? "", // null 값 처리
      countries: item.countries ?? [],
      directors: item.directors ?? [],
      actors: item.actors ?? [],
      overview: item.overview ?? "",
      netizenRating: item.netizenRating ?? "",
      imgUrl: item.imgUrl,
      bgUrl: item.bgUrl ?? "",
      youtubeUrl: item.youtubeUrl ?? "",
      ottplatforms: item.ottplatforms ?? [],
      feelterTime: item.feelterTime,
      feelterPurpose: item.feelterPurpose,
      feelterOccasion: item.feelterOccasion,
      bestcoment: item.bestcoment ?? "",
      upload: item.upload ?? "",
      update: item.update,
    }));

    // `insert` 대신 `upsert` 메서드를 사용하여 데이터가 있으면 업데이트하고 없으면 삽입합니다.
    const { error: contentsError } = await client
      .from("contents")
      .upsert(contentsToInsert)
      .select();

    if (contentsError) {
      console.error("❌ `contents` 테이블 삽입 오류:", contentsError);
      throw new Error(`contents 배치 추가 실패: ${contentsError.message}`);
    }

    console.log("✅ `contents` 데이터 입력 완료!");

    return NextResponse.json({
      success: true,
      message: "모든 데이터가 성공적으로 입력되었습니다.",
    });
  } catch (error) {
    console.error("데이터 입력 중 오류 발생:", error);
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
