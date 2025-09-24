"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { useTransition, animated } from "@react-spring/web";
// 1. data/contents.ts 파일에서 데이터와 타입을 불러옵니다.
import { RankingData } from "@/lib/types/content";
import { useContentStore } from "@/lib/stores/contentStore";
import { Content } from "@/lib/types/content";
import { OTTPlatformInfo } from "@/lib/types/content";
import { useWatchHistoryStore } from "@/lib/stores/watchHistoryStore";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { convertContentToMovie } from "@/lib/utils/contentToMovieConverter";

// 확장된 RankingData 타입 (rating 속성 추가)
interface ExtendedRankingData extends RankingData {
  rating: number;
}

// ExtendedRankingData를 Content로 변환하는 함수 (역변환)
const convertRankingDataToContent = (ranking: ExtendedRankingData): Content => {
  return {
    contentsid: ranking.id,
    title: ranking.title,
    release: `${ranking.year}-01-01`, // 년도만 있으므로 임시 날짜
    age: ranking.age,
    genres: ranking.genre.split(", "),
    countries: ranking.country.split(", "),
    runningtime: ranking.runningtime,
    directors: ranking.director.split(", "),
    actors: ranking.actor.split(", "),
    overview: ranking.description,
    imgUrl: ranking.imageUrl || "",
    youtubeUrl: ranking.videoUrl || "",
    ottplatforms: "", // 이 부분은 원본 데이터에서 가져와야 함
    netizenRating: ranking.rating > 0 ? `${ranking.rating}%` : "",
    feelterTime: [],
    feelterPurpose: [],
    feelterOccasion: [],
    bgUrl: "",
    bestcoment: ranking.bestComment,
  };
};

// Content를 ExtendedRankingData로 변환하는 함수
const convertContentToRankingData = (
  content: Content,
  rank: number
): ExtendedRankingData => {
  // netizenRating이 "85%" 형태이므로 숫자로 변환
  const ratingNumber = content.netizenRating
    ? parseFloat(content.netizenRating.replace("%", ""))
    : 0;

  return {
    id: content.contentsid,
    rank: rank,
    title: content.title,
    year: new Date(content.release || new Date()).getFullYear().toString(),
    age: content.age || "전체",
    genre: Array.isArray(content.genres)
      ? content.genres.join(", ")
      : content.genres || "정보없음",
    country: Array.isArray(content.countries)
      ? content.countries.join(", ")
      : content.countries || "정보없음",
    runningtime: content.runningtime || "정보없음",
    director: Array.isArray(content.directors)
      ? content.directors.join(", ")
      : content.directors || "정보없음",
    actor: Array.isArray(content.actors)
      ? content.actors.join(", ")
      : content.actors || "정보없음",
    description: content.overview || "줄거리 정보가 없습니다.",
    imageUrl: content.imgUrl || "",
    videoUrl: content.youtubeUrl || "",
    bestComment: content.bestcoment || "베스트 댓글이 없습니다.",
    rating: ratingNumber,
  };
};

// OTT 플랫폼 이름 매핑 (더 많은 변형 추가)
const ottPlatformMap: { [key: string]: string[] } = {
  netflix: ["Netflix", "넷플릭스", "netflix"],
  disney: ["Disney+", "Disney Plus", "디즈니+", "디즈니플러스", "disney"],
  tving: ["Tving", "티빙", "tving", "TVING"],
  coupang: ["Coupang play", "쿠팡플레이", "coupang", "Coupang"],
  wavve: ["Wavve", "웨이브", "wavve", "WAVVE"],
  watcha: ["Watcha", "왓챠", "watcha", "WATCHA", "와챠"],
};

// LazyImage 컴포넌트: 이미지를 효율적으로 로드하기 위해 사용됩니다.
const LazyImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <div ref={imgRef}>
      <Image
        src={
          isVisible
            ? src
            : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="200" viewBox="0 0 150 200"></svg>'
        }
        alt={alt}
        width={150}
        height={200}
        className={className}
      />
    </div>
  );
};

// DetailsPanel 컴포넌트: 선택된 콘텐츠의 상세 정보를 보여줌
const DetailsPanel = ({
  item,
  originalContent,
}: {
  item: ExtendedRankingData | null;
  originalContent: Content | null;
}) => {
  const { addToWatchHistory } = useWatchHistoryStore();
  const { toggleFavorite, favorites } = useFavoriteStore();

  // 즐겨찾기 상태 확인 (항상 실행)
  const isCurrentFavorite = useMemo(() => {
    if (!item) return false;
    return favorites.some((fav) => fav.id == item.id);
  }, [favorites, item]);

  if (!item) {
    return (
      <div className="flex justify-center items-center h-full text-gray-400">
        <p>순위를 선택하면 정보가 표시됩니다.</p>
      </div>
    );
  }

  // 버튼 클릭 핸들러
  const handleFavoriteClick = () => {
    console.log(`💖 즐겨찾기 버튼 클릭: ${item.title}`);

    try {
      // RankingData를 Content로 변환 후 Movie로 변환
      const contentData = originalContent || convertRankingDataToContent(item);
      const movieData = convertContentToMovie(contentData);

      toggleFavorite(movieData);
      console.log(`💖 ${item.title}의 즐겨찾기 상태가 토글되었습니다.`);
    } catch (error) {
      console.error("❌ 즐겨찾기 처리 중 오류 발생:", error);
    }
  };

  const handleCommentClick = () => {
    console.log(`댓글 버튼 클릭: ${item.title}`);
    alert("댓글 기능은 개발 중입니다.");
  };

  // OTT 플랫폼 Play 버튼 클릭 핸들러
  const handleOttPlayClick = (platformUrl: string, platformName: string) => {
    console.log(`🎬 ${platformName} Play 버튼 클릭: ${item.title}`);

    try {
      // RankingData를 Content로 변환 후 Movie로 변환
      const contentData = originalContent || convertRankingDataToContent(item);
      const movieData = convertContentToMovie(contentData);

      addToWatchHistory(movieData);
      console.log(
        `🎬 ${item.title}이(가) ${platformName}에서 재생되어 시청 기록에 추가되었습니다.`
      );

      // 해당 플랫폼 URL로 이동
      window.open(platformUrl, "_blank");
    } catch (error) {
      console.error("❌ 시청 기록 처리 중 오류 발생:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="relative pt-[56.25%] mb-2 rounded-lg overflow-hidden">
        <iframe
          src={item.videoUrl}
          title="YouTube video player"
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>

      <div className="flex justify-between border border-gray-200 rounded-lg items-center mb-2">
        <div>
          <h2 className="text-xl font-bold p-2 mt-1">{item.title}</h2>
        </div>
        <div className="flex justify-between items-center gap-2 m-2">
          <button
            onClick={handleFavoriteClick}
            className={`flex items-center gap-2 px-2 py-2 border rounded-full transition-colors ${
              isCurrentFavorite
                ? "bg-[#ccff00] text-black border-black"
                : "border-gray-200 text-white hover:bg-[#ccff00] hover:text-black"
            }`}
          >
            <Heart
              size={18}
              fill={isCurrentFavorite ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={handleCommentClick}
            className="flex items-center gap-2 px-2 py-2 border border-gray-200 rounded-full text-white hover:bg-[#ccff00] hover:text-black hover:border-black transition-colors"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>

      {/* OTT 플랫폼 버튼 섹션 */}
      {originalContent && originalContent.ottplatforms && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-2 justify-start p-2  h-[50px] bg-neutral-800 rounded-lg">
            {(() => {
              // ottplatforms가 string인 경우 JSON 파싱
              let platformsArray: OTTPlatformInfo[] = [];
              if (typeof originalContent.ottplatforms === "string") {
                try {
                  platformsArray = JSON.parse(originalContent.ottplatforms);
                } catch (e) {
                  console.error("Failed to parse ottplatforms:", e);
                  platformsArray = [];
                }
              } else if (Array.isArray(originalContent.ottplatforms)) {
                platformsArray = originalContent.ottplatforms;
              }

              // 플랫폼별 매핑
              const platformMapping = [
                {
                  name: "Netflix",
                  icon: "/icon/netflixp.svg",
                  alt: "넷플릭스재생",
                },
                {
                  name: "Tving",
                  icon: "/icon/tvingp.svg",
                  alt: "티빙재생",
                },
                {
                  name: "Coupang play",
                  icon: "/icon/coupangp.svg",
                  alt: "쿠팡플레이재생",
                },
                {
                  name: "Wavve",
                  icon: "/icon/wavvep.svg",
                  alt: "웨이브재생",
                },
                {
                  name: "Disney+",
                  icon: "/icon/disneyp.svg",
                  alt: "디즈니플러스재생",
                },
                {
                  name: "Watcha",
                  icon: "/icon/watchap.svg",
                  alt: "왓챠재생",
                },
              ];

              return platformMapping
                .map((platform) => {
                  // 해당 플랫폼의 URL 찾기
                  const platformInfo = platformsArray.find(
                    (p: OTTPlatformInfo) => p.name === platform.name
                  );

                  if (!platformInfo || !platformInfo.url) {
                    return null;
                  }

                  return (
                    <button
                      key={platform.name}
                      onClick={() =>
                        handleOttPlayClick(platformInfo.url, platform.name)
                      }
                      className="hover:border hover:border-white hover:rounded-xl transition-colors"
                    >
                      <Image
                        src={platform.icon}
                        alt={platform.alt}
                        width={70}
                        height={30}
                        className="border border-white/30 rounded-xl"
                      />
                    </button>
                  );
                })
                .filter(Boolean); // null 값 제거
            })()}
          </div>
        </div>
      )}

      <div className="grid grid-col gap-2 text-sm mb-4">
        <div className="p-2 bg-neutral-800 text-xs text-gray-400 rounded-lg">
          <p>
            · {item.year}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; · {item.age}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; · {item.genre}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; · {item.runningtime}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; · {item.country}
          </p>
        </div>

        <div className="p-2 bg-neutral-800 rounded-lg">
          <h3 className="text-sm text-[#DDE66E] mb-1">
            감독 &nbsp;&nbsp;&nbsp;
            <span className="text-sm text-white">{item.director}</span>{" "}
          </h3>

          <h3 className="text-sm text-[#DDE66E] mb-1">
            출연 &nbsp;&nbsp;&nbsp;
            <span className="text-sm text-white">{item.actor}</span>{" "}
          </h3>
        </div>
        <div className="p-2 bg-neutral-800 rounded-lg">
          <h3 className="text-sm text-[#DDE66E] mb-1">
            줄거리&nbsp;&nbsp;&nbsp;
            <span className="text-sm text-white mb-1">
              {item.description}
            </span>{" "}
          </h3>
        </div>
      </div>
    </div>
  );
};

// RankingList 컴포넌트: 인기 순위 리스트를 렌더링
const RankingList = ({
  data = [],
  onSelect,
  selectedId,
}: {
  data?: ExtendedRankingData[];
  onSelect: (item: ExtendedRankingData) => void;
  selectedId: number | null;
}) => {
  const [isTop5, setIsTop5] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTop5((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const ranksToShow = isTop5 ? data.slice(0, 5) : data.slice(5, 10);

  // useTransition 훅을 사용하여 애니메이션을 적용합니다.
  const transitions = useTransition(ranksToShow, {
    key: (item: ExtendedRankingData) => item.id, // 각 아이템을 고유하게 식별하는 키
    from: { opacity: 0, transform: "rotateX(90deg)" },
    enter: { opacity: 1, transform: "rotateX(0deg)" },
    config: { mass: 1, tension: 100, friction: 30 },
    trail: 300,
  });

  return (
    <div className=" w-full lg:w-120 flex-shrink-0 relative">
      <ul className="space-y-4">
        {transitions((style, item) => (
          <animated.li
            style={style}
            key={item.id}
            onClick={() => onSelect(item)}
            className={`flex items-center space-x-4 cursor-pointer p-3 rounded-lg transition-colors duration-200 ${
              selectedId === item.id
                ? "bg-[#DDE66E] shadow-md"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            <span
              className={`text-2xl font-bold w-8 text-center ${
                selectedId === item.id ? "text-neutral-800" : "text-white"
              }`}
            >
              {item.rank}
            </span>
            <div className="flex-shrink-0 w-14 h-20 rounded-md overflow-hidden">
              <LazyImage
                src={
                  item.imageUrl ||
                  `https://placehold.co/64x80/333/FFF?text=${item.rank}`
                }
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold text-lg truncate ${
                  selectedId === item.id ? "text-neutral-800" : "text-white"
                }`}
              >
                {item.title}
              </h4>
              <p
                className={`text-sm ${
                  selectedId === item.id ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {item.genre} · {item.year}
              </p>
              <p
                className={`text-sm truncate ${
                  selectedId === item.id ? "text-neutral-800" : "text-white"
                }`}
              >
                {item.bestComment}
              </p>
            </div>
          </animated.li>
        ))}
      </ul>
    </div>
  );
};

// Main App 컴포넌트 (변경 없음)
export default function App() {
  const { contents, fetchAllContents, isLoading, error } = useContentStore();

  const [selectedItem, setSelectedItem] = useState<ExtendedRankingData | null>(
    null
  );
  const [selectedOriginalContent, setSelectedOriginalContent] =
    useState<Content | null>(null);

  // OTT 플랫폼 선택 상태 - 기본값으로 All 선택됨
  const [selectedOtts, setSelectedOtts] = useState({
    netflix: false,
    tving: false,
    coupang: false,
    wavve: false,
    disney: false,
    watcha: false,
  });

  const [isAllSelected, setIsAllSelected] = useState(true); // 기본값 true로 설정

  // 컴포넌트 마운트 시 contents 데이터 가져오기
  useEffect(() => {
    fetchAllContents();
  }, [fetchAllContents]);

  // 선택된 OTT 배열을 생성하는 함수
  const getSelectedOttArray = (): string[] => {
    if (isAllSelected) {
      return []; // 전체 선택시 빈 배열 반환 (모든 OTT 표시)
    }

    return Object.entries(selectedOtts)
      .filter(([, isSelected]) => isSelected)
      .map(([ottName]) => ottName);
  };

  // 올해부터 역순으로 netizenRating 높은 순으로 10개 필터링
  const rankingData = useMemo(() => {
    if (!contents || contents.length === 0) {
      return [];
    }

    console.log(`🔍 전체 contents 수:`, contents.length);

    const currentYear = new Date().getFullYear();
    console.log(`📅 현재 년도:`, currentYear);

    // 1. 올해부터 역순으로 콘텐츠 필터링 (충분한 콘텐츠가 나올 때까지)
    let filteredByYear: Content[] = [];
    let yearToCheck = currentYear;

    while (filteredByYear.length < 100 && yearToCheck >= currentYear - 10) {
      // 최대 10년 전까지 확인, 더 많은 콘텐츠 확보
      const contentsOfYear = contents.filter((content) => {
        const year = new Date(content.release || new Date()).getFullYear();
        return year === yearToCheck;
      });

      console.log(`📅 ${yearToCheck}년 콘텐츠 수:`, contentsOfYear.length);
      filteredByYear = [...filteredByYear, ...contentsOfYear];
      yearToCheck--;
    }

    console.log(`📅 총 필터링된 콘텐츠 수:`, filteredByYear.length);

    // 2. OTT 플랫폼 필터링
    let filteredContents = filteredByYear;

    if (!isAllSelected) {
      const selectedOttNames = getSelectedOttArray();
      console.log(`🎬 선택된 OTT:`, selectedOttNames);

      // Watcha 선택 시 전체 데이터에서 Watcha 관련 콘텐츠 개수 확인
      if (selectedOttNames.includes("watcha")) {
        const allWatchaContents = contents.filter((content) => {
          if (!content.ottplatforms) return false;

          let platforms: OTTPlatformInfo[] = [];
          if (typeof content.ottplatforms === "string") {
            try {
              platforms = JSON.parse(content.ottplatforms) as OTTPlatformInfo[];
            } catch {
              return false;
            }
          } else if (Array.isArray(content.ottplatforms)) {
            platforms = content.ottplatforms as OTTPlatformInfo[];
          }

          return platforms.some((platform) =>
            ottPlatformMap.watcha.some(
              (name) =>
                platform.name &&
                platform.name.toLowerCase().includes(name.toLowerCase())
            )
          );
        });

        console.log(
          `📊 전체 DB에서 Watcha 콘텐츠 수:`,
          allWatchaContents.length
        );
        console.log(
          `📊 Watcha 콘텐츠 제목들:`,
          allWatchaContents.map((c) => c.title).slice(0, 15)
        );

        const watchaByYear: { [key: number]: number } = {};
        allWatchaContents.forEach((content) => {
          const year = new Date(content.release || new Date()).getFullYear();
          watchaByYear[year] = (watchaByYear[year] || 0) + 1;
        });
        console.log(`📊 Watcha 콘텐츠 년도별 분포:`, watchaByYear);

        // 년도 필터링에서 누락되는 Watcha 콘텐츠 확인
        const watchaInFilteredByYear = filteredByYear.filter((content) => {
          if (!content.ottplatforms) return false;

          let platforms: OTTPlatformInfo[] = [];
          if (typeof content.ottplatforms === "string") {
            try {
              platforms = JSON.parse(content.ottplatforms) as OTTPlatformInfo[];
            } catch {
              return false;
            }
          } else if (Array.isArray(content.ottplatforms)) {
            platforms = content.ottplatforms as OTTPlatformInfo[];
          }

          return platforms.some((platform) =>
            ottPlatformMap.watcha.some(
              (name) =>
                platform.name &&
                platform.name.toLowerCase().includes(name.toLowerCase())
            )
          );
        });

        console.log(
          `📊 년도 필터링 후 Watcha 콘텐츠 수:`,
          watchaInFilteredByYear.length
        );
        console.log(
          `📊 년도 필터링 후 Watcha 제목들:`,
          watchaInFilteredByYear.map((c) => c.title)
        );
      }

      if (selectedOttNames.length > 0) {
        filteredContents = filteredByYear.filter((content) => {
          if (!content.ottplatforms) {
            console.log(`❌ ottplatforms 없음:`, content.title);
            return false;
          }

          let platforms: OTTPlatformInfo[] = [];
          if (typeof content.ottplatforms === "string") {
            try {
              platforms = JSON.parse(content.ottplatforms) as OTTPlatformInfo[];
            } catch {
              console.log(
                `❌ JSON 파싱 실패:`,
                content.title,
                content.ottplatforms
              );
              platforms = [];
            }
          } else if (Array.isArray(content.ottplatforms)) {
            platforms = content.ottplatforms as OTTPlatformInfo[];
          }

          console.log(
            `🔍 ${content.title}의 플랫폼들:`,
            platforms.map((p) => p.name)
          );

          const hasMatchingPlatform = selectedOttNames.some((selectedOtt) => {
            const platformNames = ottPlatformMap[selectedOtt] || [];
            console.log(`🎯 찾는 플랫폼 (${selectedOtt}):`, platformNames);

            const found = platforms.some((platform) =>
              platformNames.some((name) => {
                const match =
                  platform.name &&
                  platform.name.toLowerCase().includes(name.toLowerCase());
                if (match) {
                  console.log(
                    `✅ 매치 발견:`,
                    content.title,
                    `- ${platform.name} 포함 ${name}`
                  );
                }
                return match;
              })
            );
            return found;
          });

          if (!hasMatchingPlatform) {
            console.log(`❌ 매치 안됨:`, content.title);
          }

          return hasMatchingPlatform;
        });
      }
    }

    console.log(`🎯 OTT 필터링 후 콘텐츠 수:`, filteredContents.length);

    // 3. netizenRating과 year로 정렬 (rating 높은 순, 년도 최신 순)
    const sortedContents = filteredContents
      .filter((content) => content.netizenRating) // rating이 있는 것만
      .sort((a, b) => {
        const ratingA = parseFloat((a.netizenRating || "0").replace("%", ""));
        const ratingB = parseFloat((b.netizenRating || "0").replace("%", ""));

        // 1차 정렬: netizenRating (높은 순)
        if (ratingA !== ratingB) {
          return ratingB - ratingA;
        }

        // 2차 정렬: 년도 (최신 순)
        const yearA = new Date(a.release || new Date()).getFullYear();
        const yearB = new Date(b.release || new Date()).getFullYear();
        return yearB - yearA;
      })
      .slice(0, 10); // 상위 10개

    // 4. 10개가 안 되면 rating이 없는 콘텐츠도 포함해서 10개 채우기
    if (sortedContents.length < 10) {
      console.log(
        `🔄 현재 ${sortedContents.length}개, 추가로 ${
          10 - sortedContents.length
        }개 필요`
      );

      // 이미 포함된 콘텐츠의 ID 목록
      const includedIds = new Set(
        sortedContents.map((content) => content.contentsid)
      );

      const remainingContents = filteredContents
        .filter((content) => !includedIds.has(content.contentsid)) // 중복 제거
        .sort((a, b) => {
          // rating이 있는 것 우선, 그 다음 년도 최신 순
          const hasRatingA = !!a.netizenRating;
          const hasRatingB = !!b.netizenRating;

          if (hasRatingA !== hasRatingB) {
            return hasRatingB ? 1 : -1; // rating 있는 것 우선
          }

          // 년도 최신 순으로 정렬
          const yearA = new Date(a.release || new Date()).getFullYear();
          const yearB = new Date(b.release || new Date()).getFullYear();
          return yearB - yearA;
        })
        .slice(0, 10 - sortedContents.length); // 부족한 만큼만

      sortedContents.push(...remainingContents);
      console.log(`📈 추가 콘텐츠 ${remainingContents.length}개 추가됨`);
      console.log(
        `📋 추가된 콘텐츠:`,
        remainingContents.map((c) => ({
          title: c.title,
          rating: c.netizenRating,
        }))
      );
    }

    console.log(`⭐ 최종 순위 콘텐츠 수:`, sortedContents.length);

    // 5. RankingData로 변환 (원본 Content 정보와 함께)
    const rankingItems = sortedContents.map((content, index) => ({
      ranking: convertContentToRankingData(content, index + 1),
      originalContent: content,
    }));

    console.log(
      `🏆 변환된 순위 데이터:`,
      rankingItems.map((item) => ({
        rank: item.ranking.rank,
        title: item.ranking.title,
        rating: item.ranking.rating,
      }))
    );

    return rankingItems;
  }, [contents, selectedOtts, isAllSelected]);

  // 첫 번째 항목을 기본 선택으로 설정
  useEffect(() => {
    if (rankingData.length > 0 && !selectedItem) {
      setSelectedItem(rankingData[0].ranking);
      setSelectedOriginalContent(rankingData[0].originalContent);
    }
  }, [rankingData, selectedItem]);

  // 아이템 선택 핸들러
  const handleItemSelect = (item: ExtendedRankingData) => {
    setSelectedItem(item);
    // 원본 Content 찾기
    const originalContent =
      rankingData.find((data) => data.ranking.id === item.id)
        ?.originalContent || null;
    setSelectedOriginalContent(originalContent);
  };

  // '전체' 버튼 클릭 핸들러
  const handleAllClick = () => {
    const newIsAllSelected = !isAllSelected;
    setIsAllSelected(newIsAllSelected);

    if (newIsAllSelected) {
      // 전체 선택시 모든 개별 버튼 해제
      setSelectedOtts({
        netflix: false,
        tving: false,
        coupang: false,
        wavve: false,
        disney: false,
        watcha: false,
      });
    }
  };

  // 개별 OTT 버튼 클릭 핸들러
  const handleOttClick = (ottName: string) => {
    // 전체 버튼이 선택되어 있으면 먼저 해제
    if (isAllSelected) {
      setIsAllSelected(false);
    }

    const newSelectedOtts = {
      ...selectedOtts,
      [ottName]: !selectedOtts[ottName as keyof typeof selectedOtts],
    };
    setSelectedOtts(newSelectedOtts);

    // 모든 개별 버튼이 해제되면 전체 버튼 활성화
    const hasAnySelected = Object.values(newSelectedOtts).some(Boolean);
    if (!hasAnySelected) {
      setIsAllSelected(true);
    }
  };

  return (
    <div className="p-4 flex flex-col lg:flex-row items-start lg:items-stretch gap-4 font-sans">
      <div className="w-full lg:flex-1">
        <DetailsPanel
          item={selectedItem}
          originalContent={selectedOriginalContent}
        />
      </div>
      <div className="w-full lg:w-auto">
        {/* OTT 플랫폼 버튼 섹션 */}
        <div className="flex flex-wrap gap-2 mb-4 rounded-lg justify-center">
          {/* '전체' 버튼 */}
          <button
            className="transition-transform duration-100 active:scale-90"
            onClick={handleAllClick}
          >
            {isAllSelected ? (
              <Image
                src="/icon/alls.svg"
                alt="전체 선택됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block"
              />
            ) : (
              <Image
                src="/icon/alln.svg"
                alt="전체 선택 안됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block border border-white/30 rounded-lg"
              />
            )}
          </button>

          {/* 넷플릭스 버튼 */}
          <button
            className="p-1 transition-transform duration-100 active:scale-90"
            onClick={() => handleOttClick("netflix")}
          >
            {selectedOtts.netflix ? (
              <Image
                src="/icon/netflixs.svg"
                alt="넷플릭스 선택됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block"
              />
            ) : (
              <Image
                src="/icon/netflixn.svg"
                alt="넷플릭스 선택 안됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block border border-white/30 rounded-lg"
              />
            )}
          </button>

          {/* 티빙 버튼 */}
          <button
            className="p-1 transition-transform duration-100 active:scale-90"
            onClick={() => handleOttClick("tving")}
          >
            {selectedOtts.tving ? (
              <Image
                src="/icon/tvings.svg"
                alt="티빙 선택됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block"
              />
            ) : (
              <Image
                src="/icon/tvingn.svg"
                alt="티빙 선택 안됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block border border-white/30 rounded-lg"
              />
            )}
          </button>

          {/* 쿠팡 버튼 */}
          <button
            className="p-1 transition-transform duration-100 active:scale-90"
            onClick={() => handleOttClick("coupang")}
          >
            {selectedOtts.coupang ? (
              <Image
                src="/icon/coupangs.svg"
                alt="쿠팡 선택됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block"
              />
            ) : (
              <Image
                src="/icon/coupangn.svg"
                alt="쿠팡 선택 안됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block border border-white/30 rounded-lg"
              />
            )}
          </button>

          {/* 웨이브 버튼 */}
          <button
            className="p-1 transition-transform duration-100 active:scale-90"
            onClick={() => handleOttClick("wavve")}
          >
            {selectedOtts.wavve ? (
              <Image
                src="/icon/wavves.svg"
                alt="웨이브 선택됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block"
              />
            ) : (
              <Image
                src="/icon/wavven.svg"
                alt="웨이브 선택 안됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block border border-white/30 rounded-lg"
              />
            )}
          </button>

          {/* 디즈니 버튼 */}
          <button
            className="p-1 transition-transform duration-100 active:scale-90"
            onClick={() => handleOttClick("disney")}
          >
            {selectedOtts.disney ? (
              <Image
                src="/icon/disneys.svg"
                alt="디즈니 선택됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block"
              />
            ) : (
              <Image
                src="/icon/disneyn.svg"
                alt="디즈니 선택 안됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block border border-white/30 rounded-lg"
              />
            )}
          </button>

          {/* 왓챠 버튼 */}
          <button
            className="p-1 transition-transform duration-100 active:scale-90"
            onClick={() => handleOttClick("watcha")}
          >
            {selectedOtts.watcha ? (
              <Image
                src="/icon/watchas.svg"
                alt="왓챠 선택됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block"
              />
            ) : (
              <Image
                src="/icon/watchan.svg"
                alt="왓챠 선택 안됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block border border-white/30 rounded-lg"
              />
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">순위 데이터를 불러오는 중...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-500">
              오류가 발생했습니다: {error}
            </div>
          </div>
        ) : rankingData.length > 0 ? (
          <RankingList
            data={rankingData.map((item) => item.ranking)}
            onSelect={handleItemSelect}
            selectedId={selectedItem?.id ?? null}
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-400">
              조건에 맞는 콘텐츠가 없습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
