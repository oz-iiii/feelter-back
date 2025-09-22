"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BiX, BiChevronDown, BiChevronUp } from "react-icons/bi";
import { useContentStore } from "@/lib/stores/contentStore";
import { useWatchHistoryStore } from "@/lib/stores/watchHistoryStore";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { Content, OTTPlatformInfo } from "@/lib/types/content";
import { Heart, MessageCircle } from "lucide-react";
import { convertContentToMovie } from "@/lib/utils/contentToMovieConverter";

interface ContentModalProps {
  content: Content | null;
  onClose: () => void;
}

const ContentModal: React.FC<ContentModalProps> = ({ content, onClose }) => {
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const { contents } = useContentStore();
  const { addToWatchHistory } = useWatchHistoryStore();
  const { favorites, toggleFavorite } = useFavoriteStore();

  // ContentItem에서 해당하는 Movie 데이터 찾기
  const findContentByTitle = (title: string): Content | null => {
    return contents.find((item) => item.title === title) || null;
  };

  const contentData = content ? findContentByTitle(content.title) : null;

  // YouTube URL 처리 개선
  const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;

    // 이미 embed URL인 경우
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    // 일반 YouTube URL을 embed URL로 변환
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }

    return null;
  };

  // YouTube 비디오 ID 추출
  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(
    contentData?.youtubeUrl || content?.youtubeUrl
  );
  const isYoutube = youtubeEmbedUrl !== null;

  // 디버깅용 콘솔 로그
  console.log("ContentModal Debug:", {
    contentTitle: content?.title,
    contentDataYoutubeUrl: contentData?.youtubeUrl,
    contentYoutubeUrl: content?.youtubeUrl,
    youtubeEmbedUrl,
    isYoutube,
  });

  const overviewText =
    contentData?.overview || content?.overview || "상세 정보가 없습니다.";
  const showReadMore = overviewText.length > 150;
  const displayedOverview =
    isOverviewExpanded || !showReadMore
      ? overviewText
      : `${overviewText.substring(0, 150)}...`;

  // 현재 콘텐츠가 즐겨찾기에 있는지 실시간으로 확인 (useMemo로 최적화)
  const isCurrentFavorite = useMemo(() => {
    if (!content) return false;
    const result = favorites.some((fav) => fav.id == content.contentsid);
    console.log(`🔍 ${content.title} 즐겨찾기 상태 (useMemo):`, result);
    console.log(
      `📋 현재 즐겨찾기 목록:`,
      favorites.map((f) => f.title)
    );
    return result;
  }, [content, favorites]);

  // 버튼 클릭 핸들러 (toggleFavorite 사용)
  const handleFavoriteClick = () => {
    if (!content) return;

    try {
      // Content를 Movie 형식으로 변환
      const movieData = convertContentToMovie(content);

      console.log(`🔄 토글 전 즐겨찾기 상태:`, isCurrentFavorite);
      console.log(
        `🆔 현재 content ID:`,
        content.contentsid,
        typeof content.contentsid
      );
      console.log(
        `📋 즐겨찾기 목록:`,
        favorites.map((f) => f.title)
      );

      // toggleFavorite 함수 사용 (더 안전함)
      toggleFavorite(movieData);

      if (isCurrentFavorite) {
        console.log(`💔 ${content.title}이(가) 즐겨찾기에서 제거되었습니다.`);
      } else {
        console.log(`💖 ${content.title}이(가) 즐겨찾기에 추가되었습니다.`);
      }
    } catch (error) {
      console.error("❌ 즐겨찾기 처리 중 오류 발생:", error);
    }
  };

  const handleCommentClick = () => {
    console.log(`댓글 버튼 클릭: ${content?.title}`);
    alert("댓글 기능은 개발 중입니다.");
  };

  // OTT 플랫폼 play 버튼 클릭 핸들러
  const handleOttPlayClick = (platformName: string, url: string) => {
    if (!content) return;

    try {
      // Content를 Movie 형식으로 변환하여 시청 기록에 추가
      const movieData = convertContentToMovie(content);
      addToWatchHistory(movieData);
      console.log(
        `🎬 ${content.title}이(가) ${platformName}에서 재생되어 시청 기록에 추가되었습니다.`
      );

      // 해당 플랫폼 URL로 이동
      window.open(url, "_blank");
    } catch (error) {
      console.error("❌ 시청 기록 추가 중 오류 발생:", error);
      // 에러가 발생해도 일단 URL은 열어줍니다
      window.open(url, "_blank");
    }
  };

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="bg-[#181818] w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-lg shadow-xl relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-20"
              aria-label="Close modal"
            >
              <BiX size={32} />
            </button>

            {/* Main Content - 세로 레이아웃 */}
            <div className="flex flex-col mt-5 mb-7 h-full items-center">
              {/* 예고편 동영상 컨테이너 */}
              <div className="relative overflow-hidden px-6 py-2 w-full max-w-4xl">
                {isYoutube ? (
                  <div
                    key={youtubeEmbedUrl}
                    className="relative w-full"
                    style={{ paddingTop: "56.25%" }}
                  >
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={youtubeEmbedUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  // YouTube 영상이 없을 때 포스터 이미지 표시
                  <div
                    className="relative w-80 bg-gray-800 rounded-xl overflow-hidden"
                    style={{ paddingTop: "56.25%" }}
                  >
                    {content.imgUrl ? (
                      <Image
                        src={content.imgUrl}
                        alt={`${content.title} 포스터`}
                        width={200}
                        height={300}
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

              {/* Content Details - 예고편 아래 위치 */}
              <div className="px-6 md:px-10 flex flex-col justify-start flex-1 w-full max-w-4xl">
                <div className="space-y-3">
                  {/* Title */}
                  <div className="flex justify-between items-center gap-2">
                    <h1 className="text-2xl font-bold">{content.title}</h1>
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
                    </div>
                  </div>
                  {/* netizenRating and runningtime */}
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    {content.release && (
                      <span className="flex items-center">
                        ·{content.release.split("-")[0]}
                      </span>
                    )}
                    {content.age && <span>· {content.age}</span>}
                    {content?.genres
                      ? (content.genres ? "· " : "") + // 여기에 점을 추가하는 조건문
                        (Array.isArray(content.genres)
                          ? content.genres.join(", ")
                          : content.genres)
                      : "정보 없음"}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {content.runningtime && (
                      <span>· {content.runningtime}</span>
                    )}
                    {content.countries && <span>· {content.countries}</span>}
                  </div>

                  {/* OTT Platform Buttons */}
                  <div className="flex flex-wrap gap-2 h-7">
                    {/* 플랫폼 URL이 있는 경우에만 버튼 표시 */}
                    {(() => {
                      const platforms =
                        contentData?.ottplatforms || content?.ottplatforms;

                      // ottplatforms가 string인 경우 JSON 파싱
                      let platformsArray: OTTPlatformInfo[] = [];
                      if (typeof platforms === "string") {
                        try {
                          platformsArray = JSON.parse(platforms);
                        } catch (e) {
                          console.error("Failed to parse ottplatforms:", e);
                          platformsArray = [];
                        }
                      } else if (Array.isArray(platforms)) {
                        platformsArray = platforms;
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
                                handleOttPlayClick(
                                  platform.name,
                                  platformInfo.url
                                )
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

                  {/* Director */}
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">감독</h3>
                    <p className="text-sm text-gray-200">
                      {content?.directors
                        ? Array.isArray(content.actors)
                          ? content.directors.join(", ")
                          : content.directors
                        : "정보 없음"}
                    </p>
                    <br />
                    {/* Cast */}
                    <h3 className="text-sm text-gray-400 mb-1">출연</h3>
                    <p className="text-sm text-gray-200">
                      {content?.actors
                        ? Array.isArray(content.actors)
                          ? content.actors.join(", ")
                          : content.actors
                        : "정보 없음"}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">줄거리</h3>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      {displayedOverview}
                    </p>
                    {showReadMore && (
                      <button
                        onClick={() =>
                          setIsOverviewExpanded(!isOverviewExpanded)
                        }
                        className="flex items-center gap-1 text-gray-400 hover:text-white mt-2 text-sm"
                      >
                        <span>
                          {isOverviewExpanded ? "간략히" : "상세보기"}
                        </span>
                        {isOverviewExpanded ? (
                          <BiChevronUp />
                        ) : (
                          <BiChevronDown />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContentModal;
