"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IoFilmOutline } from "@react-icons/all-files/io5/IoFilmOutline";
import { IoHeartOutline } from "@react-icons/all-files/io5/IoHeartOutline";
import { IoHeart } from "@react-icons/all-files/io5/IoHeart";
import { IoChatbubbleOutline } from "@react-icons/all-files/io5/IoChatbubbleOutline";
import { IoCaretForwardCircleOutline } from "@react-icons/all-files/io5/IoCaretForwardCircleOutline";
import {
  useMovieStore,
  useFavoriteStore,
} from "@/lib/stores";
import { Movie } from "@/lib/types/movie";

export default function FeelterGrid() {
  const { movies, loading, fetchMovies } = useMovieStore();
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  // 영화 클릭 이벤트 핸들러
  const handleMovieClick = (id: string) => {
    // 클릭된 영화의 ID가 현재 활성화된 영화의 ID와 같으면 비활성화
    // 다르면 해당 영화를 활성화
    setActiveMovieId((prevId) => (prevId === id ? null : id));
  };

  // 즐겨찾기 토글 핸들러
  const handleFavoriteClick = (movie: Movie, e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    toggleFavorite(movie);
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-semibold">
          <IoFilmOutline size={32} className="inline-block mr-2" />
          Feelter 추천
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">영화를 불러오는 중...</div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">
        <IoFilmOutline size={32} className="inline-block mr-2" />
        Feelter 추천
      </h2>

      <div className="overflow-x-auto scroll-snap-x py-4 justify-items-center-safe w-full">
        <div className="grid grid-cols-6 gap-4 w-[980px]">
          {movies.slice(0, 18).map((movie) => (
            <div
              key={movie.id}
              className="bg-gray-300 aspect-[2/3] rounded cursor-pointer relative group"
              onClick={() => handleMovieClick(movie.id)}
            >
              <Image
                src={movie.imgUrl}
                alt={`${movie.title} Poster`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.67vw"
                className="object-cover rounded"
              />

              {/* 오버레이를 호버 또는 클릭(터치) 시 보이게 함 */}
              <div
                className={`absolute inset-0 bg-black/70 rounded flex items-center justify-center transition-opacity duration-300 ${
                  activeMovieId === movie.id ? "opacity-100" : "opacity-0"
                } group-hover:opacity-100`}
              >
                <div className="flex flex-col items-center gap-4">
                  {/* 즐겨찾기 버튼 */}
                  <button
                    className="flex items-center justify-center rounded-full text-white hover:scale-110 transition-colors duration-200"
                    onClick={(e) => handleFavoriteClick(movie, e)}
                  >
                    {isFavorite(movie.id) ? (
                      <IoHeart size={54} className="text-red-500" />
                    ) : (
                      <IoHeartOutline size={54} />
                    )}
                  </button>
                  {/* 댓글 버튼 */}
                  <button className="flex items-center justify-center rounded-full text-white hover:scale-120">
                    <IoChatbubbleOutline size={48} />
                  </button>
                  {/* 플레이 버튼 */}
                  <button
                    className="flex items-center justify-center rounded-full text-white hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(movie.streamingUrl, "_blank");
                    }}
                  >
                    <IoCaretForwardCircleOutline size={54} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
