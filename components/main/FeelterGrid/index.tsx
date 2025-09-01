"use client";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { IoFilmOutline } from "@react-icons/all-files/io5/IoFilmOutline";
import { IoHeartOutline } from "@react-icons/all-files/io5/IoHeartOutline";
import { IoChatbubbleOutline } from "@react-icons/all-files/io5/IoChatbubbleOutline";
import { IoCaretForwardCircleOutline } from "@react-icons/all-files/io5/IoCaretForwardCircleOutline";

// 임시 영화 포스터 데이터
const posters = [
  {
    id: 1,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/xA7fRlFT8M8iFRwYYDZlJBD44Xf.jpg",
  },
  {
    id: 2,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/lrhbbIlRsRAY11qHQ366VKht6lv.jpg",
  },
  {
    id: 3,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/b9MhD5syJ7TbYSeje4wB4oyTzc7.jpg",
  },
  {
    id: 4,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/y9SDvLKABqz0FWymCz6IGhpYoFs.jpg",
  },
  {
    id: 5,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/koMkV9qm0PEZHDmX5dRpBpMH1FY.jpg",
  },
  {
    id: 6,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/yACIAqAkSLkX4coHafpyLWAtQjw.jpg",
  },
  {
    id: 7,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/wBfI2ky2ExQKhEegte0G1Kijpmd.jpg",
  },
  {
    id: 8,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/k7DCwySN2XGZ67qcz2ADbgmGwzG.jpg",
  },
  {
    id: 9,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/xk9U863Tupw4ODrvgDjeWvi2qgm.jpg",
  },
  {
    id: 10,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/anwNl1xbzXoj5Ax1nVw3WoDzHlw.jpg",
  },
  {
    id: 11,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/tNWCukAMubqisamYURvo5jw61As.jpg",
  },
  {
    id: 12,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/9yNgQH0hTsKyJv2HF1ZCVIBML7e.jpg",
  },
  {
    id: 13,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/ygr4hE8Qpagv8sxZbMw1mtYkcQE.jpg",
  },
  {
    id: 14,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/kmP6viwzcEkZeoi1LaVcQemcvZh.jpg",
  },
  {
    id: 15,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/3TMNdFDDo5O61Zh288vie8o1MvW.jpg",
  },
  {
    id: 16,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/kJEcSBMPacDJuAihPNmcUEgon1Y.jpg",
  },
  {
    id: 17,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/j9w6P6G7pgPjARnVJNbUjTC5NSQ.jpg",
  },
  {
    id: 18,
    posterUrl:
      "https://www.themoviedb.org/t/p/w1280/lvYWwQj89ioSk9WzhC1KEujmpWa.jpg",
  },
];

export default function FeelterGrid() {
  const [activePosterId, setActivePosterId] = useState<number | null>(null); // 클릭된 포스터의 ID를 저장합니다.

  // 포스터 클릭 이벤트 핸들러
  const handlePosterClick = (id: number) => {
    // 클릭된 포스터의 ID가 현재 활성화된 포스터의 ID와 같으면 비활성화
    // 다르면 해당 포스터를 활성화
    setActivePosterId((prevId) => (prevId === id ? null : id));
  };

  return (
    <section>
      <h2 className="text-lg font-semibold">
        <IoFilmOutline size={32} className="inline-block mr-2" />
        Feelter 추천
      </h2>

      <div className="overflow-x-auto scroll-snap-x py-4 justify-items-center-safe w-full">
        <div className="grid grid-cols-6 gap-4 w-[980px]">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className="bg-gray-300 aspect-[2/3] rounded cursor-pointer relative group"
              onClick={() => handlePosterClick(poster.id)}
            >
              <img
                src={poster.posterUrl}
                alt={`Movie Poster ${poster.id}`}
                className="w-full h-full object-cover rounded"
              />

              {/* 오버레이를 호버 또는 클릭(터치) 시 보이게 함 */}
              <div
                className={`absolute inset-0 bg-black/70 rounded flex items-center justify-center transition-opacity duration-300 ${
                  activePosterId === poster.id ? "opacity-100" : "opacity-0"
                } group-hover:opacity-100`}
              >
                <div className="flex flex-col items-center gap-4">
                  {/* 즐겨찾기 버튼 */}
                  <button className="flex items-center justify-center rounded-full text-white hover:scale-110">
                    <IoHeartOutline size={54} />
                  </button>
                  {/* 댓글 버튼 */}
                  <button className="flex items-center justify-center rounded-full text-white hover:scale-120">
                    <IoChatbubbleOutline size={48} />
                  </button>
                  {/* 플레이 버튼 */}
                  <button className="flex items-center justify-center rounded-full text-white hover:scale-110">
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
