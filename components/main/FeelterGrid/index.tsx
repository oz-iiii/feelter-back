"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IoFilmOutline } from "@react-icons/all-files/io5/IoFilmOutline";
import {
  useFavoriteStore,
  useMovieStore,
  useWatchHistoryStore,
} from "@/lib/stores";
import { Movie } from "@/lib/types/movie";
import { ContentItem } from "@/lib/data";

import ContentModal from "./ContentModal";

export default function FeelterGrid() {
  const { movies, loading, fetchMovies } = useMovieStore();
  // useWatchHistoryStore를 사용하여 시청 기록 추가 함수 가져오기
  const { addToWatchHistory } = useWatchHistoryStore();

  const [activeMovieId, setActiveMovieId] = useState<number | null>(null);
  const [isAllsSelected, setIsAllsSelected] = useState(false); // '전체 OTT' 버튼 상태 추가
  // 모달에 표시할 콘텐츠를 관리하는 상태
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );

  const handleCloseModal = () => {
    setSelectedContent(null);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // 영화 클릭 이벤트 핸들러
  // 영화 전체 객체를 인자로 받아서 모달 상태를 업데이트하고, 시청 이력에 추가합니다.
  const handleMovieClick = (movie: Movie) => {
    setActiveMovieId((prevId) => (prevId === movie.id ? null : movie.id));
    setSelectedContent(movie); // 여기에 선택된 영화 데이터를 상태에 저장합니다.
    addToWatchHistory(movie); // 영화 정보를 시청 이력에 추가합니다.
  };

  // '전체 OTT' 버튼 클릭 핸들러
  const handleOttsAllClick = () => {
    console.log("전체 OTT 버튼이 클릭되었습니다. 상태 토글.");
    setIsAllsSelected(!isAllsSelected); // 상태를 반전시킵니다.
    // 여기에 버튼 클릭 시 실행할 로직을 추가하세요.
    // 예: 모든 OTT의 영화를 불러오는 함수 호출
  };
  return (
    <section>
      <h2 className="text-lg font-semibold flex items-center space-x-2">
        <IoFilmOutline size={32} />
        <span>Feelter 추천</span>
        <button
          className="p-1 transition-transform duration-100 active:scale-90"
          onClick={handleOttsAllClick}
        >
          {isAllsSelected ? (
            <img
              src="/icon/alls.svg"
              alt="secleted"
              className="h-10 w-10 inline-block mx-10"
            />
          ) : (
            <img
              src="/icon/alln.svg"
              alt="none"
              className="h-10 w-10 inline-block border border-white/30 rounded-lg mx-10"
            />
          )}
        </button>
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">영화를 불러오는 중...</div>
        </div>
      ) : (
        <div className="overflow-x-auto scroll-snap-x py-4 justify-items-center-safe w-full">
          <div className="grid grid-cols-6 gap-4 w-[980px]">
            {movies.slice(0, 18).map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-300 aspect-[2/3] rounded cursor-pointer relative group"
                // onClick 함수가 movie 객체를 전달하도록 수정
                onClick={() => handleMovieClick(movie)}
              >
                <Image
                  src={movie.imgUrl}
                  alt={`${movie.title} Poster`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.67vw"
                  className="object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 모달을 컴포넌트의 최상위 return 문에 한 번만 렌더링합니다. */}
      <ContentModal content={selectedContent} onClose={handleCloseModal} />
    </section>
  );
}
