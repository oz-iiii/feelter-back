import { Content } from "@/lib/types/content";
import { Movie } from "@/lib/types/movie";

/**
 * Content 타입을 Movie 타입으로 변환하는 유틸 함수
 */
export const convertContentToMovie = (content: Content): Movie => {
  return {
    id: content.contentsid.toString(),
    tmdbid: content.contentsid, // contentsid를 tmdbid로 사용
    title: content.title,
    release: new Date(content.release || new Date()), // string을 Date로 변환
    age: content.age || "ALL",
    genre: Array.isArray(content.genres)
      ? content.genres
      : [content.genres || "기타"],
    runningTime: content.runningtime || "정보 없음",
    country: Array.isArray(content.countries)
      ? content.countries
      : [content.countries || "정보 없음"],
    director: Array.isArray(content.directors)
      ? content.directors
      : [content.directors || "정보 없음"],
    actor: Array.isArray(content.actors)
      ? content.actors
      : [content.actors || "정보 없음"],
    overview: content.overview || "줄거리 정보가 없습니다.",
    streaming: content.ottplatforms
      ? typeof content.ottplatforms === "string"
        ? content.ottplatforms
        : Array.isArray(content.ottplatforms)
        ? content.ottplatforms.map((p) => p.name).join(", ")
        : "정보 없음"
      : "정보 없음",
    streamingUrl: "", // Content에는 없는 필드
    youtubeUrl: content.youtubeUrl || "",
    imgUrl: content.imgUrl || "",
    bgUrl: content.bgUrl || "",
    feelterTime: Array.isArray(content.feelterTime)
      ? content.feelterTime
      : [content.feelterTime || ""],
    feelterPurpose: Array.isArray(content.feelterPurpose)
      ? content.feelterPurpose
      : [content.feelterPurpose || ""],
    feelterOccasion: Array.isArray(content.feelterOccasion)
      ? content.feelterOccasion
      : [content.feelterOccasion || ""],
    rating: content.netizenRating
      ? parseFloat(content.netizenRating.replace("%", "")) / 20
      : 0, // 백분율을 5점 만점으로 변환
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
