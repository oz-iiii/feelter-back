"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Heart, MessageCircle, Play } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
}

// CardCarousel 슬라이드 아이템의 데이터 타입 정의
interface SlideData extends HeroData {
  id: number;
}

// OTT별 콘텐츠 데이터의 전체 타입 정의
interface OttContent {
  name: string;
  hero: HeroData;
  slides: SlideData[];
}

// OTT별 콘텐츠 데이터입니다.
const ottData: OttContent[] = [
  {
    name: "Netflix",
    hero: {
      id: 1,
      title: "오징어 게임 시즌 3",
      year: "2025",
      age: "19+",
      genre: "드라마, 스릴러",
      country: "대한민국",
      runningtime: "7부작",
      director: "황동혁",
      actor: "이정재, 이병헌, 임시완, 강하늘, 위하준, ...",
      description:
        "빚에 허덕이는 사람들이 목숨을 걸고 게임에 뛰어드는 이야기. 충격적인 반전과 강렬한 서스펜스.",
      imageUrl:
        "https://media.themoviedb.org/t/p/w260_and_h390_bestv2/mvJu1zWa2o7isoWwa5E9TBLR2ab.jpg",
      videoUrl: "https://www.youtube.com/embed/Y9E0S0r_Elg",
    },
    slides: [
      {
        id: 2,
        title: "더 글로리",
        year: "2025",
        age: "19+",
        genre: "드라마, 스릴러",
        country: "대한민국",
        runningtime: "16부작",
        director: "안길호",
        actor:
          "송혜교, 이도현, 임지연, 염혜란, 박성훈, 정성일, 김히어라, 차주영, 김건우, ...",
        description:
          "학교 폭력으로 영혼까지 부서진 한 여자가 삶을 건 복수를 시작하는 이야기.",
        imageUrl:
          "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/wBfI2ky2ExQKhEegte0G1Kijpmd.jpg",
        videoUrl: "https://www.youtube.com/embed/dOp0oWFHUWw",
      },
      {
        id: 3,
        title: "살인자ㅇ난감",
        year: "2024",
        age: "19+",
        genre: "드라마, 스릴러",
        country: "대한민국",
        runningtime: "8부작",
        director: "이창희",
        actor: "최우식, 손석구, 이희준, ...",
        description:
          "우발적인 살인 후 자신에게 타인을 구원할 능력이 있음을 깨닫는 남자의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/e1HOt09BgYH5oZ8xfgi8TQiReYR.jpg",
        videoUrl: "https://www.youtube.com/embed/YiRAfZl7owU",
      },
      {
        id: 4,
        title: "시민덕희",
        year: "2024",
        age: "15+",
        genre: "드라마",
        country: "대한민국",
        runningtime: "114분",
        director: "박영주",
        actor: "라미란, 공명, 염혜란, 박병은, 장윤주, ...",
        description:
          "보이스피싱을 당한 평범한 시민이 직접 조직을 추적하는 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/hu4nI6znjpdLqcq2SLfLRc3CJOQ.jpg",
        videoUrl: "https://www.youtube.com/embed/w99yyjtYanE",
      },
      {
        id: 5,
        title: "범죄도시4",
        year: "2024",
        age: "15+",
        genre: "액션",
        country: "대한민국",
        runningtime: "109분",
        director: "허명행",
        actor: "마동석, 김무열, 박지환, 이동휘, 이범수, ...",
        description:
          "괴물 형사 마석도가 신종 범죄를 소탕하기 위해 나서는 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/jucHQwnRSma1O9V2bM007e4eSd7.jpg",
        videoUrl: "https://www.youtube.com/embed/Ninhkg7Jh48",
      },
      {
        id: 6,
        title: "파묘",
        year: "2024",
        age: "15+",
        genre: "미스터리, 공포",
        country: "대한민국",
        runningtime: "134분",
        director: "장재현",
        actor: "최민식, 김고은, 유해진, 이도현, 김재철, ...",
        description:
          "수상한 묘를 이장하며 기이한 사건에 휘말리는 풍수사와 장의사, 무당들의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/tw0i3kkmOTjDjGFZTLHKhoeXVvA.jpg",
        videoUrl: "https://www.youtube.com/embed/rjW9E1BR_30",
      },
      {
        id: 7,
        title: "선산",
        year: "2024",
        age: "15+",
        genre: "드라마, 스릴러",
        country: "대한민국",
        runningtime: "6부작",
        director: "민홍남",
        actor: "김현주, 박희순, 박병은, 류경수, 박성훈, ...",
        description:
          "잊고 지냈던 작은아버지의 죽음 후, 갑자기 나타난 삼촌과 함께 선산을 물려받으며 벌어지는 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/bsD8aEB3RYTUYjwkP6kIMH8HmW7.jpg",
        videoUrl: "https://www.youtube.com/embed/r-cFQxDzp1w",
      },
      {
        id: 8,
        title: "기생충",
        year: "2019",
        age: "15+",
        genre: "드라마",
        country: "대한민국",
        runningtime: "131분",
        director: "봉준호",
        actor: "송강호, 이선균, 조여정, 최우식, 박소담, ...",
        description:
          "전원 백수인 기택네 가족이 부유한 박 사장네 가족에게 서서히 기생하며 벌어지는 예측불가 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/mSi0gskYpmf1FbXngM37s2HppXh.jpg",
        videoUrl: "https://www.youtube.com/embed/jBdRhhSt3Bc",
      },
      {
        id: 9,
        title: "D.P. 시즌2",
        year: "2023",
        age: "15+",
        genre: "스릴러",
        country: "대한민국",
        runningtime: "6부작",
        director: "한준희",
        actor: "정해인, 구교환, 김성균, 손석구, 지진희, 김지현, ...",
        description:
          "군무 이탈 체포조(D.P.) 준호와 호열이 탈영병들을 쫓으며 마주하는 현실을 담은 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/ufovksqVTNogMdU5LlCVbJSiMVa.jpg",
        videoUrl: "https://www.youtube.com/embed/WXLfyrmKQUc",
      },
    ],
  },
  {
    name: "Disney+",
    hero: {
      id: 10,
      title: "무빙",
      year: "2023",
      age: "19+",
      genre: "액션, SF",
      country: "대한민국",
      runningtime: "20부작",
      director: "박인제, 박윤서",
      actor: "류승룡, 한효주, 조인성, 차태현, 류승범, 김성균, ...",
      description:
        "초능력을 숨긴 채 현재를 살아가는 아이들과 과거의 비밀을 숨긴 채 살아온 부모들의 이야기. 긴박한 액션과 따뜻한 감동이 공존합니다.",
      imageUrl:
        "https://www.themoviedb.org/t/p/w1280/b9MhD5syJ7TbYSeje4wB4oyTzc7.jpg",
      videoUrl: "https://www.youtube.com/embed/9V2tVurYTxc",
    },
    slides: [
      {
        id: 11,
        title: "로키 시즌2",
        year: "2023",
        age: "15+",
        genre: "SF",
        country: "미국",
        runningtime: "6부작",
        director: "저스틴 벤슨, 아론 무어헤드",
        actor:
          "톰 히들스턴, 오웬 윌슨, 소피아 디 마티노, 구구 바샤로, 키 호이 콴, 케이트 딕키, ...",
        description:
          "토르의 동생 로키가 TVA에 잡혀가면서 시공간을 넘나드는 모험을 겪는 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/eSdTAyGeqZsQHezhdsCildVzrdK.jpg",
        videoUrl: "https://www.youtube.com/embed/sRtVv44V4vI",
      },
      {
        id: 12,
        title: "카지노",
        year: "2023",
        age: "19+",
        genre: "스릴러",
        country: "대한민국",
        runningtime: "8부작",
        director: "강윤성",
        actor: "최민식, 손석구, 이동휘, 홍기준, 허성태, 이혜영, ...",
        description:
          "우여곡절 끝에 카지노의 왕이 된 남자, 그의 인생에 드리운 거대한 사건들의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/b7wLXWOdeyz3gWnfN5h9OI3cb4o.jpg",
        videoUrl: "https://www.youtube.com/embed/-uFz1u6W8uM",
      },
      {
        id: 13,
        title: "만달로리안 시즌3",
        year: "2023",
        age: "15+",
        genre: "SF",
        country: "미국",
        runningtime: "8부작",
        director: "릭 파미아, 칼 웨더스, 정이삭",
        actor: "페드로 파스, 칼 웨더스, ...",
        description:
          "제국이 몰락한 후, 신비로운 전사와 베이비 요다가 우주를 여행하는 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/9wOTABT35GsYNHtmFnxbRYN9d24.jpg",
        videoUrl: "https://www.youtube.com/embed/8j6MpLHWU8M",
      },
      {
        id: 14,
        title: "아바타:물의 길",
        year: "2022",
        age: "12+",
        genre: "밀리터리 SF",
        country: "미국",
        runningtime: "192분",
        director: "제임스 카메론",
        actor: "샘 워딩턴, 조 샐다나, 시고니 위버, ... ",
        description:
          "외계 행성 판도라를 탐사하는 전직 해병대원 제이크 설리의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/u2aVXft5GLBQnjzWVNda7sdDpdu.jpg",
        videoUrl: "https://www.youtube.com/embed/kihrFxwdMb4",
      },
      {
        id: 15,
        title: "인사이드 아웃 2",
        year: "2024",
        age: "전체",
        genre: "애니메이션",
        country: "미국",
        runningtime: "96분",
        director: "켈시 맨",
        actor:
          "에이미 포엘러, 마야 호크, 루이스 블랙, 필리스 스미스, 토니 헤일, ...",
        description:
          "소녀 라일리의 감정 컨트롤 본부에서 벌어지는 기쁨, 슬픔, 버럭, 까칠, 소심이의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/x2BHx02jMbvpKjMvbf8XxJkYwHJ.jpg",
        videoUrl: "https://www.youtube.com/embed/EiCmnIaj4u8",
      },
      {
        id: 16,
        title: "겨울왕국 2",
        year: "2019",
        age: "전체",
        genre: "애니메이션",
        country: "미국",
        runningtime: "103분",
        director: "크리스 벅",
        actor:
          "제니퍼 리, 크리스틴 벨, 이디나 멘젤, 조시 게드, 조나단 그로프, ...",
        description:
          "모든 것을 얼려버리는 힘을 가진 언니 엘사와, 그런 언니를 구하려는 동생 안나의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/nPwt7cv4eeUeI0t7CuWm3BctetO.jpg",
        videoUrl: "https://www.youtube.com/embed/eSEs4B4H-EA",
      },
      {
        id: 17,
        title: "샹치와 텐 링즈의 전설",
        year: "2021",
        age: "12+",
        genre: "액션, 판타지",
        country: "미국, 오스트레일리아",
        runningtime: "132분",
        director: "데스틴 크리튼",
        actor: "시무 리우, 양조위, 아콰피나, 장멍, 양자경, ...",
        description: "아버지의 뒤를 이어 운명에 맞서는 샹치의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/14L4NGrqO4r7gJtVRiSRP5rNsL5.jpg",
        videoUrl: "https://www.youtube.com/embed/Pj7CadRf82k",
      },
      {
        id: 18,
        title: "어벤져스:엔드게임",
        year: "2019",
        age: "12+",
        genre: "액션, SF",
        country: "미국",
        runningtime: "181분",
        director: "안소니 루소, 조 루소",
        actor:
          "로버트 다우니 주니어, 크리스 에반스, 크리스 헴스워스, 마크 러팔로, ...",
        description: "지구를 지키기 위해 모인 슈퍼히어로들의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/z7ilT5rNN9kDo8JZmgyhM6ej2xv.jpg",
        videoUrl: "https://www.youtube.com/embed/Ko2NWhXI9e8",
      },
    ],
  },
  {
    name: "Tving",
    hero: {
      id: 19,
      title: "피라미드 게임",
      year: "test",
      age: "test",
      genre: "테스트",
      country: "테스트",
      runningtime: "테스트",
      director: "테스트",
      actor: "테스트",
      description:
        "한 달에 한 번 비밀 투표로 왕따를 뽑는 백연여자고등학교. 투표가 지배하는 세상에서 벌어지는 게임에 전학생이 합류합니다.",
      imageUrl:
        "https://www.themoviedb.org/t/p/w1280/8QEpP4ChnziSr1nFxRzvIX69OaI.jpg",
      videoUrl: "https://www.youtube.com/embed/Q43bi242QYs",
    },
    slides: [
      {
        id: 20,
        title: "환승연애, 또 다른 시작",
        year: "test",
        age: "test",
        genre: "테스트",
        country: "테스트",
        runningtime: "테스트",
        director: "테스트",
        actor: "테스트",
        description: "헤어진 연인들이 다시 만나 사랑을 찾아가는 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/6wUDsNQHvKtaettKHHHE6uFOZCq.jpg",
        videoUrl: "https://www.youtube.com/embed/4G2izaw02pI",
      },
      {
        id: 21,
        title: "LTNS",
        year: "test",
        age: "test",
        genre: "테스트",
        country: "테스트",
        runningtime: "테스트",
        director: "테스트",
        actor: "테스트",
        description:
          "결혼 7년 차 부부가 관계 회복을 위해 불륜 커플의 뒤를 쫓으며 벌어지는 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/f71Tlsx9bl3UZvWqFynSpa7nGcl.jpg",
        videoUrl: "https://www.youtube.com/embed/vh7yeXuY59w",
      },
      {
        id: 22,
        title: "유미의 세포들",
        year: "test",
        age: "test",
        genre: "테스트",
        country: "테스트",
        runningtime: "테스트",
        director: "테스트",
        actor: "테스트",
        description:
          "평범한 직장인 유미의 연애와 일상을 머릿속 세포들의 시선으로 그려낸 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/tFs3zEL2FYaq2S0vyVyq6xWsly4.jpg",
        videoUrl: "https://www.youtube.com/embed/Uld-205xOdo",
      },
      {
        id: 23,
        title: "솔로동창회 학연",
        year: "test",
        age: "test",
        genre: "테스트",
        country: "테스트",
        runningtime: "테스트",
        director: "테스트",
        actor: "테스트",
        description:
          "설레는 만남부터 거침없는 솔직함까지, 학창 시절 친구들의 현실 로맨스 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/bzmObEUcf5toPxtPWGABPSH9kDQ.jpg",
        videoUrl: "https://www.youtube.com/embed/x9S26D4bVbA",
      },
      {
        id: 24,
        title: "콘크리트 유토피아",
        year: "test",
        age: "test",
        genre: "테스트",
        country: "테스트",
        runningtime: "테스트",
        director: "테스트",
        actor: "테스트",
        description:
          "대지진 이후 폐허가 된 서울에서 유일하게 남은 황궁 아파트 주민들의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/aKApVX9hc5otPxa3Jbf27sW6tsi.jpg",
        videoUrl: "https://www.youtube.com/embed/hAO9a1xSo3M",
      },
      {
        id: 25,
        title: "이제, 곧 죽습니다",
        year: "test",
        age: "test",
        genre: "테스트",
        country: "테스트",
        runningtime: "테스트",
        director: "테스트",
        actor: "테스트",
        description: "죽음이 반복되는 한 남자의 삶과 죽음에 대한 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/v3HpOEZtckMurMjNquzWddfwwcP.jpg",
        videoUrl: "https://www.youtube.com/embed/HZek7paY8LY",
      },
      {
        id: 26,
        title: "마우스",
        year: "test",
        age: "test",
        genre: "테스트",
        country: "테스트",
        runningtime: "테스트",
        director: "테스트",
        actor: "테스트",
        description: "싸이코패스 살인마를 쫓는 형사의 이야기.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/lrWHBK1h4rrEnx5Ml8iDR1SwNux.jpg",
        videoUrl: "https://www.youtube.com/embed/9hRTMW9K1Hg",
      },
      {
        id: 27,
        title: "아파트404",
        year: "test",
        age: "test",
        genre: "테스트",
        country: "테스트",
        runningtime: "테스트",
        director: "테스트",
        actor: "테스트",
        description: "실제로 일어난 사건들을 추적하는 추리 예능.",
        imageUrl:
          "https://www.themoviedb.org/t/p/w1280/et0MIXH2isgsuDBpBLnZT5sQnNg.jpg",
        videoUrl: "https://www.youtube.com/embed/j_HNiX_omAA",
      },
    ],
  },
];

// HeroCarousel 컴포넌트입니다.
// 메인 콘텐츠를 표시합니다.
const HeroCarousel = ({ data }: { data: HeroData }) => {
  if (!data) {
    return null;
  }

  const { videoUrl } = data;
  const isYoutube = videoUrl.includes("youtube.com/embed");

  return (
    <div className="flex flex-col">
      {/* 예고편 동영상 컨테이너: 가로세로 비율 유지 */}
      <div className="relative flex-1 overflow-hidden">
        {isYoutube && (
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
        )}
      </div>
    </div>
  );
};

// InfoGrid 컴포넌트입니다.
// 사용자 요청에 따라 3열 3행의 특별한 그리드 레이아웃을 구현합니다.
const InfoGrid = ({ data }: { data: HeroData }) => {
  // React Hooks는 컴포넌트 최상위에서 조건 없이 호출되어야 합니다.
  const [isDetailVisible, setIsDetailVisible] = useState(false);

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
    console.log(`즐겨찾기 버튼 클릭: ${data.title}`);
    alert(`${data.title}을(를) 즐겨찾기에 추가했습니다!`);
  };

  const handleCommentClick = () => {
    console.log(`댓글 버튼 클릭: ${data.title}`);
    alert("댓글 기능은 개발 중입니다.");
  };

  const handlePlayClick = () => {
    console.log(`플레이 버튼 클릭: ${data.title}`);
    alert("해당 플랫폼으로 이동합니다.");
    // 실제 동영상 재생 로직은 여기에 추가할 수 있습니다.
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
            className="flex items-center gap-2 px-2 py-2 border border-gray-200 rounded-full text-white hover:bg-[#ccff00] hover:text-black hover:border-black transition-colors"
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

      {/* 상세 정보 섹션: isDetailVisible 상태에 따라 표시/숨김 */}
      {isDetailVisible && (
        <div className="grid grid-col gap-2 text-sm">
          <div className="p-2 bg-neutral-800 text-xs rounded-lg">
            <p>
              · {year}
              &nbsp;&nbsp;&nbsp;&nbsp; · {age}
              &nbsp;&nbsp;&nbsp;&nbsp; · {genre}
              &nbsp;&nbsp;&nbsp;&nbsp; · {runningtime}
              &nbsp;&nbsp;&nbsp;&nbsp; · {country}
            </p>
          </div>

          <div className="p-2 bg-neutral-800 rounded-lg">
            <p>{director}</p>
            <p>{actor}</p>
          </div>

          <div className="p-2 bg-neutral-800 rounded-lg">
            <p className="text-sm leading-relaxed overflow-y-auto">
              {description}
            </p>
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
          width={150}
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
  const [currentOttIndex, setCurrentOttIndex] = useState(0);
  const [currentHeroContent, setCurrentHeroContent] = useState(ottData[0].hero);
  const [currentSlideId, setCurrentSlideId] = useState<number | null>(
    ottData[0].hero.id
  );

  // OTT별로 다른 배경색을 정의하는 객체입니다.
  const ottColors: { [key: string]: string } = {
    Netflix: "bg-rose-800",
    "Disney+": "bg-cyan-500",
    Tving: "bg-rose-800",
  };

  // 현재 OTT에 해당하는 배경색 클래스를 가져옵니다.
  // 해당하는 색상이 없을 경우 기본값으로 회색을 사용합니다.
  const currentColor =
    ottColors[ottData[currentOttIndex].name] || "bg-gray-800";

  // OTT 변경 시, 새로운 OTT의 히어로 콘텐츠를 설정합니다.
  useEffect(() => {
    const newOtt = ottData[currentOttIndex];
    setCurrentHeroContent(newOtt.hero);
    setCurrentSlideId(newOtt.hero.id);
  }, [currentOttIndex]);

  // 다음 OTT로 이동하는 함수
  const handleNextClick = () => {
    setCurrentOttIndex((prevIndex) =>
      prevIndex === ottData.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 이전 OTT로 이동하는 함수
  const handlePrevClick = () => {
    setCurrentOttIndex((prevIndex) =>
      prevIndex === 0 ? ottData.length - 1 : prevIndex - 1
    );
  };

  // CardCarousel 클릭 핸들러
  const handleCardClick = (cardData: SlideData) => {
    setCurrentHeroContent(cardData);
    setCurrentSlideId(cardData.id);
  };

  // 현재 OTT의 슬라이드 데이터를 가져옵니다.
  const currentOtt = ottData[currentOttIndex];
  // 히어로 카드를 슬라이드 데이터에 추가합니다.
  const slidesWithHero = [currentOtt.hero, ...currentOtt.slides];

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
        <InfoGrid data={currentHeroContent} />
        <CardCarousel
          slides={slidesWithHero}
          onCardClick={handleCardClick}
          currentSlideId={currentSlideId}
        />
      </div>
    </div>
  );
}
