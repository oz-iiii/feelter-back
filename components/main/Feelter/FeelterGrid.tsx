"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IoFilmOutline } from "@react-icons/all-files/io5/IoFilmOutline";
import { useContentStore } from "@/lib/stores/contentStore";
import ContentModal from "./ContentModal";
import { Content, ContentFilters } from "@/lib/types/content";

// 기존 필터 형식을 새로운 ContentFilters 형식으로 변환하는 헬퍼 함수
const convertFiltersToContentFilters = (filters: {
  time: string;
  purpose: string;
  occasion: string;
}): ContentFilters => {
  return {
    time: filters.time ? [filters.time] : [],
    purpose: filters.purpose ? [filters.purpose] : [],
    occasion: filters.occasion ? [filters.occasion] : [],
  };
};

export default function FeelterGrid({
  filters,
}: {
  filters: {
    time: string;
    purpose: string;
    occasion: string;
  };
}) {
  // 초기 필터 적용 완료 상태
  const [isInitialFilterApplied, setIsInitialFilterApplied] = useState(false);
  const {
    filteredContents,
    isFilterLoading,
    error,
    fetchFilteredContents,
    clearError,
  } = useContentStore();

  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

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

  // 선택된 OTT 배열을 생성하는 함수
  const getSelectedOttArray = (): string[] => {
    if (isAllSelected) {
      return []; // 전체 선택시 빈 배열 반환 (모든 OTT 표시)
    }

    return Object.entries(selectedOtts)
      .filter(([, isSelected]) => isSelected)
      .map(([ottName]) => ottName);
  };

  // 컴포넌트 마운트 시와 필터 변경 시 콘텐츠 재조회
  useEffect(() => {
    // 필터값이 모두 설정되었는지 확인 (빈 문자열이 아닌 경우)
    if (!filters.time || !filters.purpose || !filters.occasion) {
      return;
    }

    const contentFilters = convertFiltersToContentFilters(filters);
    const selectedOttArray = getSelectedOttArray();

    // 항상 필터링된 콘텐츠를 가져옴 (기본 필터값 포함)
    fetchFilteredContents(contentFilters, selectedOttArray);

    // 초기 필터 적용 완료 표시
    if (!isInitialFilterApplied) {
      setIsInitialFilterApplied(true);
    }
  }, [
    filters.time,
    filters.purpose,
    filters.occasion,
    selectedOtts,
    isAllSelected,
    fetchFilteredContents,
  ]);

  // 강제로 초기 필터를 적용하는 useEffect (백업)
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (
  //       !isInitialFilterApplied &&
  //       filters.time &&
  //       filters.purpose &&
  //       filters.occasion
  //     ) {
  //       const contentFilters = convertFiltersToContentFilters(filters);
  //       console.log("초기contentFilters", contentFilters);
  //       fetchFilteredContents(contentFilters, []);
  //       setIsInitialFilterApplied(true);
  //     }
  //   }, 100); // 100ms 후 실행

  //   return () => clearTimeout(timer);
  // }, [filters, isInitialFilterApplied, fetchFilteredContents]);

  useEffect(() => {
    if (filters.time && filters.purpose && filters.occasion) {
      const contentFilters = convertFiltersToContentFilters(filters);
      fetchFilteredContents(contentFilters, []);
      setIsInitialFilterApplied(true);
    }
  }, [filters, fetchFilteredContents]);

  const handleCloseModal = () => {
    setSelectedContent(null);
    if (error) {
      clearError();
    }
  };

  const handleContentClick = (content: Content) => {
    setSelectedContent(content);
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
    <section>
      <div className="flex flex-col md:flex-row md:items-center my-4">
        {/* 1. 필터 추천 글씨 섹션 */}
        <h2 className="text-lg font-semibold flex items-center space-x-2">
          <IoFilmOutline size={32} />
          <span>Feelter 추천</span>
        </h2>

        {/* 2. OTT 버튼 섹션 */}
        <div className="flex flex-wrap gap-2 md:ml-4 mt-2 md:mt-0">
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
                className="h-10 w-10 inline-block ml-10"
              />
            ) : (
              <Image
                src="/icon/alln.svg"
                alt="전체 선택 안됨"
                width={40}
                height={40}
                className="h-10 w-10 inline-block border border-white/30 rounded-lg ml-10"
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
      </div>

      {isFilterLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">영화를 불러오는 중...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">
            오류가 발생했습니다: {error}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto scroll-snap-x py-4 justify-items-center-safe w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 md:px-0">
            {filteredContents.slice(0, 18).map((content) => (
              <div
                key={content.contentsid}
                className="bg-gray-300 aspect-[2/3] rounded-lg cursor-pointer relative group overflow-hidden"
                onClick={() => handleContentClick(content)}
              >
                {content.imgUrl && (
                  <Image
                    src={content.imgUrl}
                    alt={`${content.title} Poster`}
                    width={200}
                    height={300}
                    className="rounded-lg object-cover w-full h-full"
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ContentModal content={selectedContent} onClose={handleCloseModal} />
    </section>
  );
}
