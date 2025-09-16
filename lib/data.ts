// Search page data
export interface ContentItem {
  title: string;
  year?: number;
  genre?: string[];
  rating?: number;
  poster?: string;
  popularity?: number;
  description?: string;
}

export const MASTER_DATA = {
  platforms: [
    "Netflix",
    "Disney+",
    "Amazon Prime",
    "Apple TV+",
    "Watcha",
    "Tving",
  ],
  genres: [
    "액션",
    "드라마",
    "코미디",
    "로맨스",
    "SF",
    "스릴러",
    "판타지",
    "애니메이션",
  ],
  years: Array.from({ length: 30 }, (_, i) => String(2024 - i)),
  ratings: ["9점 이상", "8점 이상", "7점 이상", "6점 이상"],
};
