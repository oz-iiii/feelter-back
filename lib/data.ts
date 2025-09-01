// src/lib/data.ts

export interface ContentItem {
  title: string;
  year: number;
  genre: string;
  imageUrl: string;
  rating?: number;
  popularity?: number;
}

export const sampleContent: ContentItem[] = [
  {
    title: "밴드센트",
    year: 2023,
    genre: "드라마",
    imageUrl: "https://via.placeholder.com/200x300?text=밴드센트",
    rating: 8.8,
    popularity: 100,
  },
  {
    title: "JUNG",
    year: 2023,
    genre: "뮤지컬",
    imageUrl: "https://via.placeholder.com/200x300?text=JUNG",
    rating: 8.5,
    popularity: 90,
  },
  {
    title: "코미디 버라이어티 쇼",
    year: 2023,
    genre: "코미디",
    imageUrl: "https://via.placeholder.com/200x300?text=코미디",
    rating: 9.0,
    popularity: 120,
  },
  {
    title: "개발자의",
    year: 2023,
    genre: "SF",
    imageUrl: "https://via.placeholder.com/200x300?text=개발자",
    rating: 8.9,
    popularity: 110,
  },
  {
    title: "마스터의 하우스",
    year: 2023,
    genre: "스릴러",
    imageUrl: "https://via.placeholder.com/200x300?text=마스터",
    rating: 9.2,
    popularity: 150,
  },
  {
    title: "로맨틱 스토리",
    year: 2023,
    genre: "로맨스",
    imageUrl: "https://via.placeholder.com/200x300?text=로맨틱",
    rating: 8.7,
    popularity: 95,
  },
  {
    title: "액션 히어로",
    year: 2024,
    genre: "액션",
    imageUrl: "https://via.placeholder.com/200x300?text=액션",
    rating: 9.5,
    popularity: 200,
  },
];

export const MASTER_DATA = {
  platforms: ["넷플릭스", "디즈니+", "웨이브", "티빙", "쿠팡플레이"],
  genres: [
    "액션",
    "드라마",
    "코미디",
    "SF",
    "스릴러",
    "로맨스",
    "공포",
    "다큐멘터리",
  ],
  ratings: ["6점 이상", "7점 이상", "8점 이상", "9점 이상"],
  years: [
    "2020 이상 최신작",
    "2015 이상",
    "2010 이상",
    "2005 이상",
    "2000 이상",
    "2000 이전작",
  ],
};
