// Search page data
export interface ContentItem {
  title: string;
  year?: number;

  genre?: string | string[];
  poster?: string;
  popularity?: number;
  description?: string;
  age?: string;
  country?: string | string[];
  runtime?: string;
  platform?: string | string[];
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
    "공포",
    "가족",
    "다큐멘터리",
    "범죄",
    "미스터리",
    "서부",
    "전쟁",
    "뮤지컬",
  ],
  years: ["2020년대", "2010년대", "2000년대", "1990년대", "1980년대"],
  ratings: [
    "6점 이상 ~ 7점 미만",
    "7점 이상 ~ 8점 미만",
    "8점 이상 ~ 9점 미만",
    "9점 이상 ~ 10점 미만",
  ],
  ages: ["전체관람가", "12세", "15세", "18세"],
  countries: ["국내", "해외(주요국)", "해외(기타)"],
  runtimes: ["90분 이하", "90-120분", "120-150분", "150분 이상"],
};
