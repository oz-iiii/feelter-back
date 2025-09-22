import { supabase } from "@/lib/supabase";
import type {
  Content,
  ContentFilters,
  OTTPlatformInfo,
} from "@/lib/types/content";

class ContentService {
  private readonly TABLE_NAME = "contents";

  /**
   * 모든 콘텐츠를 가져오는 함수
   */
  async getAllContents(): Promise<Content[]> {
    try {
      const { data, error } = await supabase.from(this.TABLE_NAME).select("*");

      if (error) {
        console.error("콘텐츠 가져오기 실패:", error);
        throw new Error(error.message);
      }

      const contents = data || [];

      // release 날짜 기준 내림차순 정렬 (최신순)
      const sortedContents = contents.sort((a, b) => {
        if (!a.release || !b.release) {
          return 0;
        }

        const dateA = new Date(a.release);
        const dateB = new Date(b.release);

        return dateB.getTime() - dateA.getTime();
      });

      return sortedContents;
    } catch (error) {
      console.error("getAllContents 에러:", error);
      throw error;
    }
  }

  /**
   * 선택된 필터에 따라 콘텐츠를 필터링하는 함수 (OTT 플랫폼 필터링 포함)
   */
  async getFilteredContents(
    filters: ContentFilters,
    selectedOtts?: string[]
  ): Promise<Content[]> {
    try {
      console.log("🔍 필터링 시작:", { filters, selectedOtts });

      // 먼저 모든 콘텐츠를 가져와서 구조 확인
      const allContents = await this.getAllContents();
      console.log("📊 전체 콘텐츠 수:", allContents.length);

      if (allContents.length > 0) {
        console.log("🎯 첫 번째 콘텐츠 샘플:", {
          contentsid: allContents[0].contentsid,
          title: allContents[0].title,
          ottplatforms: allContents[0].ottplatforms,
          ottplatformsType: typeof allContents[0].ottplatforms,
          feelterTime: allContents[0].feelterTime,
          feelterPurpose: allContents[0].feelterPurpose,
          feelterOccasion: allContents[0].feelterOccasion,
        });
      }

      // 필터가 모두 비어있고 OTT 필터도 전체 선택이면 전체 콘텐츠 반환
      const hasNoFilters =
        filters.time.length === 0 &&
        filters.purpose.length === 0 &&
        filters.occasion.length === 0;
      const hasNoOttFilter = !selectedOtts || selectedOtts.length === 0;

      if (hasNoFilters && hasNoOttFilter) {
        console.log("📝 모든 필터가 비어있음, 전체 콘텐츠 반환");
        return allContents;
      }

      const filteredResults = this.clientSideFilter(
        allContents,
        filters,
        selectedOtts
      );
      console.log("✅ 필터링 결과:", filteredResults.length, "개");

      return filteredResults;
    } catch (error) {
      console.error("getFilteredContents 에러:", error);
      throw error;
    }
  }

  /**
   * 클라이언트 사이드에서 정확한 필터링을 수행하는 함수 (OTT 플랫폼 필터링 포함)
   */
  private clientSideFilter(
    contents: Content[],
    filters: ContentFilters,
    selectedOtts?: string[]
  ): Content[] {
    if (!contents || contents.length === 0) {
      console.log("❌ 콘텐츠 배열이 비어있음");
      return [];
    }

    console.log("🔧 클라이언트 필터링 시작:", {
      총콘텐츠수: contents.length,
      필터조건: filters,
      선택된OTT: selectedOtts,
    });

    // OTT 플랫폼 이름 매핑
    const ottNameMapping: { [key: string]: string[] } = {
      netflix: ["Netflix", "netflix", "NETFLIX", "넷플릭스"],
      tving: ["Tving", "tving", "TVING", "티빙"],
      coupang: ["Coupang Play", "coupang", "COUPANG", "쿠팡플레이", "쿠팡"],
      wavve: ["Wavve", "wavve", "WAVVE", "웨이브"],
      disney: ["Disney+", "disney", "DISNEY", "디즈니", "Disney Plus"],
      watcha: ["Watcha", "watcha", "WATCHA", "왓챠"],
    };

    const matchingContents: Content[] = [];
    const debugResults = {
      totalProcessed: 0,
      timeFilterPassed: 0,
      purposeFilterPassed: 0,
      occasionFilterPassed: 0,
      ottFilterPassed: 0,
      finalMatches: 0,
      nullFieldsCount: {
        feelterTime: 0,
        feelterPurpose: 0,
        feelterOccasion: 0,
        ottplatforms: 0,
      },
    };

    contents.forEach((content, index) => {
      debugResults.totalProcessed++;

      // null/undefined 필드 카운트
      if (!content.feelterTime) debugResults.nullFieldsCount.feelterTime++;
      if (!content.feelterPurpose)
        debugResults.nullFieldsCount.feelterPurpose++;
      if (!content.feelterOccasion)
        debugResults.nullFieldsCount.feelterOccasion++;
      if (!content.ottplatforms) debugResults.nullFieldsCount.ottplatforms++;

      // 모든 필터가 비어있으면 모든 콘텐츠 반환
      const hasNoFilters =
        filters.time.length === 0 &&
        filters.purpose.length === 0 &&
        filters.occasion.length === 0;
      const hasNoOttFilter = !selectedOtts || selectedOtts.length === 0;

      if (hasNoFilters && hasNoOttFilter) {
        matchingContents.push(content);
        debugResults.finalMatches++;
        return;
      }

      let matches = true;
      const individualMatches = {
        timeMatch: true,
        purposeMatch: true,
        occasionMatch: true,
        ottMatch: true,
      };

      // OTT 플랫폼 필터 검사 (가장 먼저 실행)
      if (selectedOtts && selectedOtts.length > 0) {
        let contentOttPlatforms: OTTPlatformInfo[] = [];

        if (!content.ottplatforms) {
          contentOttPlatforms = [];
        } else if (typeof content.ottplatforms === "string") {
          try {
            contentOttPlatforms = JSON.parse(content.ottplatforms);
            // 파싱 결과가 배열이 아니면 빈 배열로 설정
            if (!Array.isArray(contentOttPlatforms)) {
              contentOttPlatforms = [];
            }
          } catch {
            console.warn(
              `OTT 플랫폼 JSON 파싱 실패 (${content.title}):`,
              content.ottplatforms
            );
            contentOttPlatforms = [];
          }
        } else if (Array.isArray(content.ottplatforms)) {
          contentOttPlatforms = content.ottplatforms;
        } else {
          contentOttPlatforms = [];
        }

        // OTT 플랫폼 이름 추출 및 매칭
        const contentOttNames = contentOttPlatforms
          .map((platform) => {
            // platform이 객체인 경우 name 속성 추출, 아니면 그대로 사용
            if (typeof platform === "object" && platform !== null) {
              return platform.name || "";
            }
            return platform || "";
          })
          .filter((name) => name && typeof name === "string")
          .map((name) => name.trim())
          .filter((name) => name.length > 0);

        individualMatches.ottMatch = selectedOtts.some((selectedOtt) => {
          const possibleNames = ottNameMapping[selectedOtt] || [selectedOtt];
          return contentOttNames.some((contentOttName) =>
            possibleNames.some((possibleName) => {
              const contentName = contentOttName.toLowerCase();
              const searchName = possibleName.toLowerCase();
              return (
                contentName.includes(searchName) ||
                searchName.includes(contentName)
              );
            })
          );
        });

        if (individualMatches.ottMatch) debugResults.ottFilterPassed++;
        matches = matches && individualMatches.ottMatch;

        // OTT 필터 상세 디버깅 (처음 3개만)
        if (index < 3) {
          console.log(`🎬 OTT 필터 상세 (${content.title}):`, {
            원본필드: content.ottplatforms,
            원본타입: typeof content.ottplatforms,
            파싱된배열: contentOttPlatforms,
            추출된이름들: contentOttNames,
            선택된OTT: selectedOtts,
            가능한이름들: selectedOtts.map(
              (ott) => ottNameMapping[ott] || [ott]
            ),
            매치결과: individualMatches.ottMatch,
          });
        }
      }

      // Time 필터 검사
      if (filters.time.length > 0) {
        let contentTimeArray: string[] = [];

        if (!content.feelterTime) {
          contentTimeArray = [];
        } else if (typeof content.feelterTime === "string") {
          try {
            const parsed = JSON.parse(content.feelterTime);
            contentTimeArray = Array.isArray(parsed)
              ? parsed
              : [content.feelterTime];
          } catch {
            if (content.feelterTime.includes(",")) {
              contentTimeArray = content.feelterTime
                .split(",")
                .map((s) => s.trim());
            } else {
              contentTimeArray = [content.feelterTime.trim()];
            }
          }
        } else if (Array.isArray(content.feelterTime)) {
          contentTimeArray = content.feelterTime.map((s) => s.trim());
        }

        individualMatches.timeMatch = filters.time.some((selectedTime) =>
          contentTimeArray.some(
            (contentTime) =>
              contentTime.trim().toLowerCase() ===
              selectedTime.trim().toLowerCase()
          )
        );

        if (individualMatches.timeMatch) debugResults.timeFilterPassed++;
        matches = matches && individualMatches.timeMatch;

        if (index < 3) {
          console.log(`⏰ Time 필터 상세 (${content.title}):`, {
            원본필드: content.feelterTime,
            파싱된배열: contentTimeArray,
            필터조건: filters.time,
            매치결과: individualMatches.timeMatch,
          });
        }
      }

      // Purpose 필터 검사
      if (filters.purpose.length > 0) {
        let contentPurposeArray: string[] = [];

        if (!content.feelterPurpose) {
          contentPurposeArray = [];
        } else if (typeof content.feelterPurpose === "string") {
          try {
            const parsed = JSON.parse(content.feelterPurpose);
            contentPurposeArray = Array.isArray(parsed)
              ? parsed
              : [content.feelterPurpose];
          } catch {
            if (content.feelterPurpose.includes(",")) {
              contentPurposeArray = content.feelterPurpose
                .split(",")
                .map((s) => s.trim());
            } else {
              contentPurposeArray = [content.feelterPurpose.trim()];
            }
          }
        } else if (Array.isArray(content.feelterPurpose)) {
          contentPurposeArray = content.feelterPurpose.map((s) => s.trim());
        }

        individualMatches.purposeMatch = filters.purpose.some(
          (selectedPurpose) =>
            contentPurposeArray.some(
              (contentPurpose) =>
                contentPurpose.trim().toLowerCase() ===
                selectedPurpose.trim().toLowerCase()
            )
        );

        if (individualMatches.purposeMatch) debugResults.purposeFilterPassed++;
        matches = matches && individualMatches.purposeMatch;

        if (index < 3) {
          console.log(`🎯 Purpose 필터 상세 (${content.title}):`, {
            원본필드: content.feelterPurpose,
            파싱된배열: contentPurposeArray,
            필터조건: filters.purpose,
            매치결과: individualMatches.purposeMatch,
          });
        }
      }

      // Occasion 필터 검사
      if (filters.occasion.length > 0) {
        let contentOccasionArray: string[] = [];

        if (!content.feelterOccasion) {
          contentOccasionArray = [];
        } else if (typeof content.feelterOccasion === "string") {
          try {
            const parsed = JSON.parse(content.feelterOccasion);
            contentOccasionArray = Array.isArray(parsed)
              ? parsed
              : [content.feelterOccasion];
          } catch {
            if (content.feelterOccasion.includes(",")) {
              contentOccasionArray = content.feelterOccasion
                .split(",")
                .map((s) => s.trim());
            } else {
              contentOccasionArray = [content.feelterOccasion.trim()];
            }
          }
        } else if (Array.isArray(content.feelterOccasion)) {
          contentOccasionArray = content.feelterOccasion.map((s) => s.trim());
        }

        individualMatches.occasionMatch = filters.occasion.some(
          (selectedOccasion) =>
            contentOccasionArray.some(
              (contentOccasion) =>
                contentOccasion.trim().toLowerCase() ===
                selectedOccasion.trim().toLowerCase()
            )
        );

        if (individualMatches.occasionMatch)
          debugResults.occasionFilterPassed++;
        matches = matches && individualMatches.occasionMatch;

        if (index < 3) {
          console.log(`👥 Occasion 필터 상세 (${content.title}):`, {
            원본필드: content.feelterOccasion,
            파싱된배열: contentOccasionArray,
            필터조건: filters.occasion,
            매치결과: individualMatches.occasionMatch,
          });
        }
      }

      if (matches) {
        matchingContents.push(content);
        debugResults.finalMatches++;
      }

      // 상세 디버깅 (처음 10개만)
      if (index < 10) {
        console.log(`🔍 ${content.title} 필터링 결과:`, {
          ottMatch: individualMatches.ottMatch,
          timeMatch: individualMatches.timeMatch,
          purposeMatch: individualMatches.purposeMatch,
          occasionMatch: individualMatches.occasionMatch,
          최종결과: matches,
        });
      }
    });

    // 전체 디버깅 요약
    console.log("📊 필터링 결과 요약:", debugResults);

    // release 날짜 기준 내림차순 정렬 (최신순)
    const sortedContents = matchingContents.sort((a, b) => {
      // release 필드가 있는지 확인
      if (!a.release || !b.release) {
        return 0;
      }

      // 날짜 문자열을 Date 객체로 변환하여 비교
      const dateA = new Date(a.release);
      const dateB = new Date(b.release);

      // 내림차순 정렬 (최신 날짜가 앞으로)
      return dateB.getTime() - dateA.getTime();
    });

    console.log("📅 release 날짜 기준 정렬 완료:", sortedContents.length, "개");

    return sortedContents;
  }

  /**
   * 특정 플랫폼의 콘텐츠만 가져오는 함수
   */
  async getContentsByPlatform(platform: string): Promise<Content[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("platform", platform);

      if (error) {
        console.error("플랫폼별 콘텐츠 가져오기 실패:", error);
        throw new Error(error.message);
      }

      const contents = data || [];

      // release 날짜 기준 내림차순 정렬 (최신순)
      const sortedContents = contents.sort((a, b) => {
        if (!a.release || !b.release) {
          return 0;
        }

        const dateA = new Date(a.release);
        const dateB = new Date(b.release);

        return dateB.getTime() - dateA.getTime();
      });

      return sortedContents;
    } catch (error) {
      console.error("getContentsByPlatform 에러:", error);
      throw error;
    }
  }

  /**
   * 콘텐츠 검색 함수
   */
  async searchContents(searchTerm: string): Promise<Content[]> {
    try {
      if (!searchTerm.trim()) return [];

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .or(
          `title.ilike.%${searchTerm}%,genre.ilike.%${searchTerm}%,platform.ilike.%${searchTerm}%`
        );

      if (error) {
        console.error("콘텐츠 검색 실패:", error);
        throw new Error(error.message);
      }

      const contents = data || [];

      // release 날짜 기준 내림차순 정렬 (최신순)
      const sortedContents = contents.sort((a, b) => {
        if (!a.release || !b.release) {
          return 0;
        }

        const dateA = new Date(a.release);
        const dateB = new Date(b.release);

        return dateB.getTime() - dateA.getTime();
      });

      return sortedContents;
    } catch (error) {
      console.error("searchContents 에러:", error);
      throw error;
    }
  }

  /**
   * 인기 콘텐츠 가져오기 (평점 기준)
   */
  async getPopularContents(limit: number = 10): Promise<Content[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .order("rating", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("인기 콘텐츠 가져오기 실패:", error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("getPopularContents 에러:", error);
      throw error;
    }
  }

  /**
   * 최신 콘텐츠 가져오기 (release 날짜 기준)
   */
  async getLatestContents(limit: number = 10): Promise<Content[]> {
    try {
      const { data, error } = await supabase.from(this.TABLE_NAME).select("*");

      if (error) {
        console.error("최신 콘텐츠 가져오기 실패:", error);
        throw new Error(error.message);
      }

      const contents = data || [];

      // release 날짜 기준 내림차순 정렬 후 limit 적용 (최신순)
      const sortedContents = contents
        .sort((a, b) => {
          if (!a.release || !b.release) {
            return 0;
          }

          const dateA = new Date(a.release);
          const dateB = new Date(b.release);

          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);

      return sortedContents;
    } catch (error) {
      console.error("getLatestContents 에러:", error);
      throw error;
    }
  }

  /**
   * 단일 콘텐츠 상세 정보 가져오기
   */
  async getContentById(contentId: number): Promise<Content | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("contentsid", contentId)
        .single();

      if (error) {
        console.error("콘텐츠 상세 정보 가져오기 실패:", error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("getContentById 에러:", error);
      throw error;
    }
  }

  /**
   * 랜덤 콘텐츠 추천
   */
  async getRandomRecommendations(count: number = 5): Promise<Content[]> {
    try {
      // 모든 콘텐츠를 가져와서 클라이언트에서 랜덤 선택
      // Supabase의 RANDOM() 함수 대신 클라이언트 랜덤 사용
      const allContents = await this.getAllContents();

      if (allContents.length === 0) return [];

      // Fisher-Yates 셔플 알고리즘
      const shuffled = [...allContents];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled.slice(0, count);
    } catch (error) {
      console.error("getRandomRecommendations 에러:", error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const contentService = new ContentService();
export default contentService;

export { ContentService };
