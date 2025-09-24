"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Heart, MessageCircle, Play } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useContentStore } from "@/lib/stores/contentStore";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { useWatchHistoryStore } from "@/lib/stores/watchHistoryStore";
import { Content, OTTPlatformInfo } from "@/lib/types/content";
import { convertContentToMovie } from "@/lib/utils/contentToMovieConverter";
// HeroCarousel 컴포넌트의 데이터 타입 정의
interface HeroData {
  id: number;
  title: string;
  year: string;
  age: string;
  genre: string;
  country: string;
  runningtime: string;
  director: string;
  actor: string;
  description: string;
  imageUrl?: string; // 이미지 URL은 이제 필수가 아닙니다.
  videoUrl: string;
  ottplatforms?: string | OTTPlatformInfo[]; // OTT 플랫폼 정보 추가
}

// CardCarousel 슬라이드 아이템의 데이터 타입 정의
interface SlideData extends HeroData {
  id: number;
}

// Content를 HeroData/SlideData로 변환하는 유틸 함수
const convertContentToHeroData = (content: Content): HeroData => {
  return {
    id: content.contentsid,
    title: content.title,
    year: content.release
      ? new Date(content.release).getFullYear().toString()
      : "2024",
    age: content.age || "ALL",
    genre: Array.isArray(content.genres)
      ? content.genres.join(", ")
      : content.genres || "드라마",
    country: Array.isArray(content.countries)
      ? content.countries.join(", ")
      : content.countries || "대한민국",
    runningtime: content.runningtime || "정보 없음",
    director: Array.isArray(content.directors)
      ? content.directors.join(", ")
      : content.directors || "정보 없음",
    actor: Array.isArray(content.actors)
      ? content.actors.join(", ")
      : content.actors || "정보 없음",
    description: content.overview || "줄거리 정보가 없습니다.",
    imageUrl: content.imgUrl,
    videoUrl: content.youtubeUrl || "",
    ottplatforms: content.ottplatforms,
  };
};

// HeroCarousel 컴포넌트입니다.
// 메인 콘텐츠를 표시합니다.
const HeroCarousel = ({ data }: { data: HeroData }) => {
  if (!data) {
    return null;
  }

  const { videoUrl, imageUrl, title } = data;
  const isYoutube = videoUrl && videoUrl.includes("youtube.com/embed");

  return (
    <div className="flex flex-col">
      {/* 예고편 동영상 컨테이너: 가로세로 비율 유지 */}
      <div className="relative flex-1 overflow-hidden">
        {isYoutube ? (
          // key를 iframe에 직접 추가하여 영상 URL이 바뀔 때마다 컴포넌트를 강제로 재생성합니다.
          <div
            key={videoUrl}
            className="relative w-full"
            style={{ paddingTop: "56.25%" }}
          >
            <iframe
              className="absolute top-0 left-0 rounded-xl w-full h-full"
              src={`${videoUrl}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          // 예고편이 없을 때 포스터 이미지 표시
          <div
            className="relative w-full bg-gray-800 rounded-xl overflow-hidden"
            style={{ paddingTop: "56.25%" }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${title} 포스터`}
                width={800}
                height={450}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p>예고편이 없습니다</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// InfoGrid 컴포넌트입니다.
// 사용자 요청에 따라 3열 3행의 특별한 그리드 레이아웃을 구현합니다.
const InfoGrid = ({
  data,
  onFavoriteClick,
  onPlayClick,
  isCurrentFavorite,
  currentPlatformName,
}: {
  data: HeroData;
  onFavoriteClick: (data: HeroData) => void;
  onPlayClick: (data: HeroData, platformName: string) => void;
  isCurrentFavorite: boolean;
  currentPlatformName: string;
}) => {
  // React Hooks는 컴포넌트 최상위에서 조건 없이 호출되어야 합니다.
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  // Props 디버깅
  console.log(`🔧 InfoGrid props:`, {
    data: data?.title,
    onFavoriteClick: typeof onFavoriteClick,
    onPlayClick: typeof onPlayClick,
    isCurrentFavorite,
    currentPlatformName,
  });

  // 데이터가 없을 경우 미리 반환합니다. 훅이 먼저 선언되었기 때문에 이 코드는 안전합니다.
  if (!data) {
    return null;
  }

  // 더보기 버튼 클릭 시 상세 정보 표시 상태를 토글하는 함수
  const handleToggleDetail = () => {
    setIsDetailVisible(!isDetailVisible);
  };

  const {
    year,
    age,
    genre,
    country,
    runningtime,
    director,
    actor,
    description,
  } = data;

  // 버튼 클릭 핸들러
  const handleFavoriteClick = () => {
    console.log(`💖 InfoGrid Heart 버튼 클릭: ${data.title}`);
    console.log(`🔧 onFavoriteClick 타입:`, typeof onFavoriteClick);
    console.log(`🔧 data:`, data);

    if (typeof onFavoriteClick === "function") {
      console.log(`✅ onFavoriteClick 호출 시도...`);
      onFavoriteClick(data);
      console.log(`✅ onFavoriteClick 호출 완료`);
    } else {
      console.log(`❌ onFavoriteClick이 함수가 아닙니다!`);
    }
  };

  const handleCommentClick = () => {
    console.log(`댓글 버튼 클릭: ${data.title}`);
    alert("댓글 기능은 개발 중입니다.");
  };

  const handlePlayClick = () => {
    console.log(
      `🎬 InfoGrid Play 버튼 클릭: ${data.title} on ${currentPlatformName}`
    );
    onPlayClick(data, currentPlatformName);
  };

  return (
    <div className="flex-1 flex flex-col my-2 py-2">
      <div className="flex justify-between border border-gray-200 rounded-lg items-center p-2 mb-2">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">{data.title}</h2>
          {/* 더보기 아이콘 */}
          <button
            onClick={handleToggleDetail}
            className="ml-2 p-2 rounded-full text-white hover:bg-gray-200 hover:text-black transition-colors"
          >
            {isDetailVisible ? (
              <ChevronUp size={24} />
            ) : (
              <ChevronDown size={24} />
            )}
          </button>
        </div>
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={handleFavoriteClick}
            className={`flex items-center gap-2 px-2 py-2 border rounded-full transition-colors ${
              isCurrentFavorite
                ? "bg-[#ccff00] text-black border-black hover:bg-[#ccff00] hover:text-black hover:border-black"
                : "border-gray-200 text-white hover:bg-[#ccff00] hover:text-black hover:border-black"
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
          <button
            onClick={handlePlayClick}
            className="flex items-center gap-2 px-2 py-2 border border-gray-200 rounded-full text-white hover:bg-[#ccff00] hover:text-black hover:border-black transition-colors"
          >
            <Play size={18} />
          </button>
        </div>
      </div>

      {/* 상세 정보 섹션: isDetailVisible 상태에 따라 표시/숨김 */}
      {isDetailVisible && (
        <div className="grid grid-col gap-2 text-sm">
          <div className="p-2 bg-neutral-800 text-xs text-gray-400 rounded-lg">
            <p>
              · {year}
              &nbsp;&nbsp;&nbsp;&nbsp; · {age}
              &nbsp;&nbsp;&nbsp;&nbsp; · {genre}
              &nbsp;&nbsp;&nbsp;&nbsp; · {runningtime}
              &nbsp;&nbsp;&nbsp;&nbsp; · {country}
            </p>
          </div>

          <div className="p-2 bg-neutral-800 rounded-lg">
            <h3 className="text-sm text-[#DDE66E] mb-1">
              감독 &nbsp;&nbsp;&nbsp;
              <span className="text-sm text-white">{director}</span>
            </h3>
            <h3 className="text-sm text-[#DDE66E] mb-1">
              출연 &nbsp;&nbsp;&nbsp;
              <span className="text-sm text-white">{actor}</span>
            </h3>
          </div>

          <div className="p-2 bg-neutral-800 rounded-lg">
            <h3 className="text-sm text-[#DDE66E] mb-1">
              줄거리 &nbsp;&nbsp;&nbsp;
              <span className="text-sm text-white">{description}</span>
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

// CardCarousel 컴포넌트입니다.
// 작은 카드 슬라이드를 표시하고 클릭 시 메인 Hero 콘텐츠를 업데이트합니다.
const CardCarousel = ({
  slides,
  onCardClick,
  currentSlideId,
}: {
  slides: SlideData[];
  onCardClick: (item: SlideData) => void;
  currentSlideId: number | null;
}) => {
  // 각 슬라이드 아이템을 렌더링하는 컴포넌트입니다.
  const SlideItemComponent = ({
    item,
    onClick,
    isActive,
  }: {
    item: SlideData;
    onClick: (item: SlideData) => void;
    isActive: boolean;
  }) => {
    if (!item) {
      return null;
    }
    const { id, title, imageUrl } = item;

    // 클릭 이벤트 핸들러: 이미 활성화된 카드는 클릭 이벤트를 무시하여 연속 클릭을 방지합니다.
    const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      if (!isActive) {
        onClick(item);
      }
    };

    return (
      <div
        key={id}
        className={`flex-none w-[150px] ml-1 cursor-pointer hover:scale-105 transition-transform duration-200 ${
          isActive ? "scale-105" : ""
        }`}
        onClick={handleClick}
        onTouchEnd={handleClick}
      >
        <Image
          src={imageUrl || ""}
          alt={title || "이미지 없음"}
          width={140}
          height={200}
          className="rounded-lg shadow-lg h-[200px] object-cover"
        />
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">최근 공개된 작품들</h3>
      <div className="flex overflow-x-scroll pb-4 scroll-snap-x scroll-smooth select-none">
        {slides.map((item, index) => (
          // key prop에 item.id가 없을 경우 index를 사용하도록 대체합니다.
          <SlideItemComponent
            key={item?.id ?? index}
            item={item}
            onClick={onCardClick}
            isActive={item.id === currentSlideId}
          />
        ))}
      </div>
    </div>
  );
};

// 메인 컨테이너 컴포넌트입니다.
// 이 컴포넌트가 전체 화면을 렌더링합니다.
export default function LatestSlide() {
  const { contents, fetchAllContents } = useContentStore();
  const { favorites, toggleFavorite } = useFavoriteStore();
  const { addToWatchHistory } = useWatchHistoryStore();
  const [currentOttIndex, setCurrentOttIndex] = useState(0);
  const [currentHeroContent, setCurrentHeroContent] = useState<HeroData | null>(
    null
  );
  const [currentSlideId, setCurrentSlideId] = useState<number | null>(null);

  // OTT별로 다른 배경색을 정의하는 객체입니다.
  const ottColors: { [key: string]: string } = {
    Netflix: "bg-rose-800",
    "Disney+": "bg-cyan-500",
    Tving: "bg-rose-800",
    "Coupang play": "bg-purple-600",
    Wavve: "bg-blue-600",
    Watcha: "bg-pink-600",
  };

  // 플랫폼별로 콘텐츠를 필터링하고 정렬하여 ottData 생성
  const ottData = useMemo(() => {
    const platforms = [
      "Netflix",
      "Disney+",
      "Tving",
      "Coupang play",
      "Wavve",
      "Watcha",
    ];

    return platforms
      .map((platform) => {
        // 해당 플랫폼의 콘텐츠만 필터링
        const platformContents = contents.filter((content) => {
          if (!content.ottplatforms) return false;

          let platforms: { name: string }[] = [];
          if (typeof content.ottplatforms === "string") {
            try {
              platforms = JSON.parse(content.ottplatforms);
            } catch {
              return false;
            }
          } else if (Array.isArray(content.ottplatforms)) {
            platforms = content.ottplatforms;
          }

          return platforms.some((p) => p.name === platform);
        });

        // release 날짜 기준 내림차순 정렬 (최신순)
        const sortedContents = platformContents.sort((a, b) => {
          if (!a.release || !b.release) return 0;
          return new Date(b.release).getTime() - new Date(a.release).getTime();
        });

        // HeroData와 SlideData로 변환
        const heroData =
          sortedContents.length > 0
            ? convertContentToHeroData(sortedContents[0])
            : null;
        const slidesData = sortedContents
          .slice(0, 9)
          .map(convertContentToHeroData); // hero 포함 9개

        return {
          name: platform,
          hero: heroData,
          slides: slidesData,
        };
      })
      .filter((ott) => ott.hero !== null); // 데이터가 있는 플랫폼만
  }, [contents]);

  // 현재 OTT에 해당하는 배경색 클래스를 가져옵니다.
  const currentColor =
    ottData.length > 0
      ? ottColors[ottData[currentOttIndex]?.name] || "bg-gray-800"
      : "bg-gray-800";

  // 컴포넌트 마운트 시 콘텐츠 데이터 가져오기
  useEffect(() => {
    fetchAllContents();
  }, [fetchAllContents]);

  // OTT 변경 시, 새로운 OTT의 히어로 콘텐츠를 설정합니다.
  useEffect(() => {
    if (ottData.length > 0 && ottData[currentOttIndex]) {
      const newOtt = ottData[currentOttIndex];
      setCurrentHeroContent(newOtt.hero);
      setCurrentSlideId(newOtt.hero?.id || null);
    }
  }, [currentOttIndex, ottData]);

  // ottData가 처음 로드될 때 초기 설정
  useEffect(() => {
    if (ottData.length > 0 && !currentHeroContent) {
      setCurrentHeroContent(ottData[0].hero);
      setCurrentSlideId(ottData[0].hero?.id || null);
    }
  }, [ottData, currentHeroContent]);

  // 다음 OTT로 이동하는 함수
  const handleNextClick = () => {
    if (ottData.length > 0) {
      setCurrentOttIndex((prevIndex) =>
        prevIndex === ottData.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // 이전 OTT로 이동하는 함수
  const handlePrevClick = () => {
    if (ottData.length > 0) {
      setCurrentOttIndex((prevIndex) =>
        prevIndex === 0 ? ottData.length - 1 : prevIndex - 1
      );
    }
  };

  // CardCarousel 클릭 핸들러
  const handleCardClick = (cardData: SlideData) => {
    setCurrentHeroContent(cardData);
    setCurrentSlideId(cardData.id);
  };

  // Heart 버튼 클릭 핸들러 (즐겨찾기)
  const handleFavoriteClick = (heroData: HeroData) => {
    console.log(`🔥 메인 handleFavoriteClick 호출됨:`, heroData?.title);
    if (!heroData) {
      console.log(`❌ heroData가 null입니다.`);
      return;
    }

    try {
      // HeroData를 Content 형식으로 변환해야 함
      const contentData: Content = {
        contentsid: heroData.id,
        title: heroData.title,
        release: `${heroData.year}-01-01`, // 년도만 있으므로 임시 날짜
        age: heroData.age,
        genres: [heroData.genre],
        countries: [heroData.country],
        runningtime: heroData.runningtime,
        directors: [heroData.director],
        actors: [heroData.actor],
        overview: heroData.description,
        imgUrl: heroData.imageUrl || "",
        youtubeUrl: heroData.videoUrl,
        ottplatforms: heroData.ottplatforms || "",
        netizenRating: "",
        feelterTime: [],
        feelterPurpose: [],
        feelterOccasion: [],
        bgUrl: "",
        bestcoment: "",
      };

      console.log(`🔄 convertContentToMovie 호출 중...`);
      const movieData = convertContentToMovie(contentData);
      console.log(`🎬 변환된 movieData:`, movieData);

      console.log(`🔄 toggleFavorite 호출 중...`);
      toggleFavorite(movieData);
      console.log(`💖 ${heroData.title}의 즐겨찾기 상태가 토글되었습니다.`);
    } catch (error) {
      console.error("❌ 즐겨찾기 처리 중 오류 발생:", error);
    }
  };

  // Play 버튼 클릭 핸들러 (OTT 플랫폼 이동 + 시청 기록)
  const handlePlayClick = (heroData: HeroData, currentPlatformName: string) => {
    console.log(
      `🔥 메인 handlePlayClick 호출됨:`,
      heroData?.title,
      `플랫폼:`,
      currentPlatformName
    );
    if (!heroData) {
      console.log(`❌ heroData가 null입니다.`);
      return;
    }

    try {
      // 현재 플랫폼의 URL 찾기
      let platformUrl = "";
      console.log(`🔍 ottplatforms 데이터:`, heroData.ottplatforms);
      console.log(`🔍 찾는 플랫폼:`, currentPlatformName);

      if (heroData.ottplatforms) {
        let platforms: OTTPlatformInfo[] = [];
        if (typeof heroData.ottplatforms === "string") {
          try {
            platforms = JSON.parse(heroData.ottplatforms);
            console.log(`📝 파싱된 플랫폼들:`, platforms);
          } catch {
            console.log(`❌ JSON 파싱 실패`);
            platforms = [];
          }
        } else if (Array.isArray(heroData.ottplatforms)) {
          platforms = heroData.ottplatforms;
          console.log(`📝 배열 플랫폼들:`, platforms);
        }

        const currentPlatform = platforms.find(
          (p) => p.name === currentPlatformName
        );
        console.log(`🎯 찾은 플랫폼:`, currentPlatform);
        platformUrl = currentPlatform?.url || "";
        console.log(`🔗 플랫폼 URL:`, platformUrl);
      } else {
        console.log(`❌ ottplatforms 데이터가 없습니다.`);
      }

      if (platformUrl) {
        // 시청 기록에 추가
        const contentData: Content = {
          contentsid: heroData.id,
          title: heroData.title,
          release: `${heroData.year}-01-01`,
          age: heroData.age,
          genres: [heroData.genre],
          countries: [heroData.country],
          runningtime: heroData.runningtime,
          directors: [heroData.director],
          actors: [heroData.actor],
          overview: heroData.description,
          imgUrl: heroData.imageUrl || "",
          youtubeUrl: heroData.videoUrl,
          ottplatforms: heroData.ottplatforms || "",
          netizenRating: "",
          feelterTime: [],
          feelterPurpose: [],
          feelterOccasion: [],
          bgUrl: "",
          bestcoment: "",
        };

        const movieData = convertContentToMovie(contentData);
        addToWatchHistory(movieData);
        console.log(
          `🎬 ${heroData.title}이(가) ${currentPlatformName}에서 재생되어 시청 기록에 추가되었습니다.`
        );

        // 해당 플랫폼 URL로 이동
        window.open(platformUrl, "_blank");
      } else {
        console.log(
          `⚠️ ${currentPlatformName}에서 ${heroData.title}의 재생 URL을 찾을 수 없습니다.`
        );
      }
    } catch (error) {
      console.error("❌ 재생 처리 중 오류 발생:", error);
    }
  };

  // 로딩 중이거나 데이터가 없을 때
  if (ottData.length === 0 || !currentHeroContent) {
    return (
      <div className="flex flex-col w-full max-w-7xl mx-auto pt-20">
        <h2 className="text-2xl font-bold mb-6">| 새로나온 작품</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">콘텐츠를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 즐겨찾기 상태 확인 함수
  const isCurrentFavorite = (heroData: HeroData) => {
    if (!heroData) return false;
    const result = favorites.some((fav) => fav.id == heroData.id);
    console.log(`💖 즐겨찾기 상태 확인:`, heroData.title, `결과:`, result);
    console.log(
      `📋 현재 즐겨찾기 목록:`,
      favorites.map((f) => ({ id: f.id, title: f.title }))
    );
    return result;
  };

  // 현재 OTT의 슬라이드 데이터를 가져옵니다.
  const currentOtt = ottData[currentOttIndex];
  // CardCarousel용 슬라이드는 hero 포함 9개 (첫 번째가 hero와 동일)
  const cardCarouselSlides = currentOtt.slides;

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto pt-20">
      <h2 className="text-2xl font-bold mb-6">| 새로나온 작품</h2>
      <div className="relative overflow-hidden w-full h-auto rounded-xl p-4">
        {/* OTT 콘텐츠명과 페이지네이션 버튼 */}
        <div
          className={`flex justify-between items-center ${currentColor} h-auto rounded-xl mb-4`}
        >
          <h3 className="text-2xl font-bold px-4">{currentOtt.name}</h3>
          {/* 좌우 이동 버튼 컨테이너 */}
          <div className="flex gap-2 px-4 py-2">
            <button
              onClick={handlePrevClick}
              className="border border-gray-200 text-white p-2 rounded-full hover:bg-neutral-800/20 transition-colors duration-200"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextClick}
              className="border border-gray-200 text-white p-2 rounded-full hover:bg-neutral-800/20 transition-colors duration-200"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <HeroCarousel data={currentHeroContent} />
        {/* 새로운 InfoGrid 컴포넌트를 HeroCarousel과 CardCarousel 사이에 추가합니다. */}
        <InfoGrid
          data={currentHeroContent}
          onFavoriteClick={handleFavoriteClick}
          onPlayClick={handlePlayClick}
          isCurrentFavorite={isCurrentFavorite(currentHeroContent)}
          currentPlatformName={currentOtt.name}
        />
        <CardCarousel
          slides={cardCarouselSlides}
          onCardClick={handleCardClick}
          currentSlideId={currentSlideId}
        />
      </div>
    </div>
  );
}
