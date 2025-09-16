"use client";

import React from "react";
import Image from "next/image";
import { BiHeart, BiMessageRounded } from "react-icons/bi";
import { BsHeartFill } from "react-icons/bs";
import { ContentItem } from "@/lib/data";
import {
  useFavoriteStore,
  useMovieStore,
  useWatchHistoryStore,
} from "@/lib/stores";
import { Movie } from "@/lib/types/movie";
import { createHighlightProps } from "@/lib/utils/textHighlight";

interface ContentCardProps {
  content: ContentItem;
  onOpen: (content: ContentItem) => void;
  searchQuery?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onOpen,
  searchQuery = "",
}) => {
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const { addToWatchHistory } = useWatchHistoryStore();
  const { movies } = useMovieStore();

  // 검색어 하이라이팅 정보 생성
  const titleHighlight = createHighlightProps(content.title, searchQuery);

  // ContentItem에서 해당하는 Movie 찾기
  const findMovieByTitle = (title: string): Movie | null => {
    return movies.find((movie) => movie.title === title) || null;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event

    const movie = findMovieByTitle(content.title);
    if (movie) {
      toggleFavorite(movie);
    } else {
      // Movie를 찾을 수 없는 경우, ContentItem에서 Movie 타입 생성
      const syntheticMovie: Movie = {
        id: `synthetic_${content.title.replace(/\s+/g, "_")}`,
        tmdbid: 0,
        title: content.title,
        release: new Date(content.year || 2024, 0, 1),
        age: "전체관람가",
        genre: content.genre || "드라마",
        runningTime: "120분",
        country: "한국",
        director: "미상",
        actor: "미상",
        overview: content.description || "",
        streaming: ["Netflix"],
        streamingUrl: "https://netflix.com",
        youtubeUrl: "https://youtube.com",
        imgUrl: content.poster || "",
        bgUrl: content.poster || "",
        feelterTime: ["저녁"],
        feelterPurpose: ["휴식"],
        feelterOccasion: ["혼자"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      toggleFavorite(syntheticMovie);
    }
  };

  // 즐겨찾기 상태 확인 - 실제 Movie 또는 synthetic ID 둘 다 확인
  const movie = findMovieByTitle(content.title);
  const isCurrentlyFavorite = movie
    ? isFavorite(movie.id as number)
    : isFavorite(Number(`synthetic_${content.title.replace(/\s+/g, "_")}`));

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 시청 이력에 추가
    const movie = findMovieByTitle(content.title);
    if (movie) {
      addToWatchHistory(movie);
    } else {
      // Movie를 찾을 수 없는 경우, ContentItem에서 Movie 타입 생성
      const syntheticMovie: Movie = {
        id: `synthetic_${content.title.replace(/\s+/g, "_")}`,
        tmdbid: 0,
        title: content.title,
        release: new Date(content.year || 2024, 0, 1),
        age: "전체관람가",
        genre: content.genre || "드라마",
        runningTime: "120분",
        country: "한국",
        director: "미상",
        actor: "미상",
        overview: content.description || "",
        streaming: "Netflix",
        streamingUrl: "https://netflix.com",
        youtubeUrl: "https://youtube.com",
        imgUrl: content.poster || "",
        bgUrl: content.poster || "",
        feelterTime: ["저녁"],
        feelterPurpose: ["휴식"],
        feelterOccasion: ["혼자"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addToWatchHistory(syntheticMovie);
    }

    onOpen(content);
  };

  return (
    <div className="group relative w-[260px] h-[480px] bg-[#141A28] rounded-2xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer">
      {/* Thumbnail */}
      <div className="relative w-full h-[75%]">
        <Image
          src={content.poster || "/images/placeholder.jpg"}
          alt={content.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          className="transition-opacity duration-300 group-hover:opacity-50"
        />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button
            onClick={handleFavoriteClick}
            className="text-white transform transition-transform duration-200 hover:scale-125 hover:text-[#CCFF00]"
            aria-label="찜하기"
          >
            {isCurrentlyFavorite ? (
              <BsHeartFill size={24} className="text-red-500" />
            ) : (
              <BiHeart size={24} />
            )}
          </button>
          <button
            className="text-white transform transition-transform duration-200 hover:scale-125 hover:text-[#CCFF00]"
            aria-label="코멘트 보기"
          >
            <BiMessageRounded size={24} />
          </button>
        </div>
        <button
          className="text-white text-lg font-bold"
          onClick={handleOpenClick}
        >
          ▶ 상세보기
        </button>
      </div>

      {/* Meta Info */}
      <div className="p-4 h-[25%] flex flex-col justify-between">
        <div>
          {searchQuery ? (
            <h3
              className="font-bold text-[18px] text-white truncate"
              {...titleHighlight}
            />
          ) : (
            <h3 className="font-bold text-[18px] text-white truncate">
              {content.title}
            </h3>
          )}
          <p className="text-[14px] text-[#B0B3B8] mt-1">
            {content.year} / {content.genre}
          </p>
        </div>
        {content.rating && (
          <div className="self-start bg-[#CCFF00] text-black text-xs font-semibold px-2 py-0.5 rounded-full">
            {content.rating.toFixed(1)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
