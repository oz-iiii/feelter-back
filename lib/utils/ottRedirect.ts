import { Movie } from "@/lib/types/movie";

export interface OTTPlatformInfo {
  name: string;
  url: string;
}

/**
 * OTT 플랫폼으로 이동하고 시청 기록에 추가하는 함수
 */
export const handleOTTRedirect = (movie: Movie, addToWatchHistory: (movie: Movie, rating?: number) => void) => {
  try {
    console.log(`🔥 OTT 이동 함수 호출:`, movie?.title);

    if (!movie) {
      console.log(`❌ movie 데이터가 없습니다.`);
      return;
    }

    // OTT 플랫폼 정보 파싱
    let platforms: OTTPlatformInfo[] = [];
    let platformUrl = "";

    console.log(`🔍 movie.streaming 데이터:`, movie.streaming);

    if (movie.streaming) {
      // streaming이 문자열인 경우 (단일 플랫폼)
      if (typeof movie.streaming === "string") {
        // 일반적인 OTT 플랫폼 URL 매핑
        const ottUrls: { [key: string]: string } = {
          "Netflix": "https://www.netflix.com",
          "Disney+": "https://www.disneyplus.com",
          "Tving": "https://www.tving.com",
          "Coupang play": "https://www.coupangplay.com",
          "Wavve": "https://www.wavve.com",
          "Watcha": "https://watcha.com",
          "Amazon Prime": "https://www.primevideo.com",
        };

        platformUrl = ottUrls[movie.streaming] || "https://www.netflix.com";
        console.log(`🎯 단일 플랫폼 URL:`, platformUrl);
      }
      // streaming이 배열인 경우 (여러 플랫폼)
      else if (Array.isArray(movie.streaming)) {
        const firstPlatform = movie.streaming[0];
        const ottUrls: { [key: string]: string } = {
          "Netflix": "https://www.netflix.com",
          "Disney+": "https://www.disneyplus.com",
          "Tving": "https://www.tving.com",
          "Coupang play": "https://www.coupangplay.com",
          "Wavve": "https://www.wavve.com",
          "Watcha": "https://watcha.com",
          "Amazon Prime": "https://www.primevideo.com",
        };

        platformUrl = ottUrls[firstPlatform] || "https://www.netflix.com";
        console.log(`🎯 첫 번째 플랫폼 URL:`, platformUrl);
      }
    }

    // streamingUrl이 있는 경우 우선 사용
    if (movie.streamingUrl) {
      platformUrl = movie.streamingUrl;
      console.log(`🔗 직접 URL 사용:`, platformUrl);
    }

    if (platformUrl) {
      // 시청 기록에 추가
      addToWatchHistory(movie);
      console.log(`🎬 ${movie.title}이(가) 시청 기록에 추가되었습니다.`);

      // 해당 플랫폼 URL로 이동
      window.open(platformUrl, "_blank");
      console.log(`🚀 ${platformUrl}로 이동합니다.`);
    } else {
      console.log(`⚠️ ${movie.title}의 재생 URL을 찾을 수 없습니다.`);
      alert("재생 가능한 플랫폼을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("❌ OTT 이동 처리 중 오류 발생:", error);
    alert("재생 중 오류가 발생했습니다.");
  }
};

/**
 * OTT 플랫폼 이름 가져오기
 */
export const getOTTPlatformName = (movie: Movie): string => {
  if (!movie.streaming) return "스트리밍";

  if (typeof movie.streaming === "string") {
    return movie.streaming;
  }

  if (Array.isArray(movie.streaming)) {
    return movie.streaming[0] || "스트리밍";
  }

  return "스트리밍";
};