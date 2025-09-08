"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Play } from "lucide-react";
import { useTransition, animated } from "@react-spring/web";
// 1. data/contents.ts 파일에서 데이터와 타입을 불러옵니다.
import { popularRankings, RankingData } from "./contents";

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
  const imgRef = useRef<HTMLImageElement>(null);

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
    <img
      ref={imgRef}
      src={
        isVisible
          ? src
          : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="200" viewBox="0 0 150 200"></svg>'
      }
      alt={alt}
      className={className}
    />
  );
};

// DetailsPanel 컴포넌트: 선택된 콘텐츠의 상세 정보를 보여줌
const DetailsPanel = ({ item }: { item: RankingData | null }) => {
  if (!item) {
    return (
      <div className="flex justify-center items-center h-full text-gray-400">
        <p>순위를 선택하면 정보가 표시됩니다.</p>
      </div>
    );
  }

  // 버튼 클릭 핸들러
  const handleFavoriteClick = () => {
    console.log(`즐겨찾기 버튼 클릭: ${item.title}`);
    alert(`${item.title}을(를) 즐겨찾기에 추가했습니다!`);
  };

  const handleCommentClick = () => {
    console.log(`댓글 버튼 클릭: ${item.title}`);
    alert("댓글 기능은 개발 중입니다.");
  };

  const handlePlayClick = () => {
    console.log(`플레이 버튼 클릭: ${item.title}`);
    alert("동영상 재생을 시작합니다.");
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
          {" "}
          <h2 className="text-xl font-bold p-2 mt-1">{item.title}</h2>
        </div>
        <div className="flex justify-between items-center gap-2 m-2">
          <button
            onClick={handleFavoriteClick}
            className="flex items-center gap-2 px-2 py-2 border border-gray-200 rounded-full text-white hover:bg-[#ccff00] hover:text-black  transition-colors"
          >
            <Heart size={18} />
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

      <div className="grid grid-col gap-2 text-sm mb-4">
        <div className="p-2 bg-neutral-800 text-xs rounded-lg">
          <p>
            · {item.year}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; · {item.age}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; · {item.genre}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; · {item.runningtime}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; · {item.country}
          </p>
        </div>

        <div className="p-2 bg-neutral-800 rounded-lg">
          <p>감 &nbsp; 독 : &nbsp; {item.director}</p>
          <p>출 &nbsp; 연 : &nbsp; {item.actor}</p>
        </div>
        <div className="p-2 bg-neutral-800 h-[115px] rounded-lg">
          <p className="text-sm leading-relaxed overflow-y-auto max-h-40">
            줄거리 : &nbsp; {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// RankingList 컴포넌트: 인기 순위 리스트를 렌더링
const RankingList = ({
  data = popularRankings,
  onSelect,
  selectedId,
}: {
  data?: RankingData[];
  onSelect: (item: RankingData) => void;
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
    key: (item: RankingData) => item.id, // 각 아이템을 고유하게 식별하는 키
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
  const [selectedItem, setSelectedItem] = useState<RankingData | null>(
    popularRankings[0]
  );

  return (
    <div className="p-4 flex flex-col lg:flex-row items-start lg:items-stretch gap-4 font-sans">
      <div className="w-full lg:flex-1">
        <DetailsPanel item={selectedItem} />
      </div>
      <div className="w-full lg:w-auto">
        <RankingList
          data={popularRankings}
          onSelect={setSelectedItem}
          selectedId={selectedItem?.id ?? null}
        />
      </div>
    </div>
  );
}
