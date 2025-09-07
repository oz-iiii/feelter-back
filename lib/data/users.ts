import { User } from '@/components/common/model/types';

export const defaultUser: User = {
  id: 1,
  nickname: "영화매니아",
  email: "user@example.com",
  bio: "영화를 사랑하는 사람입니다. 다양한 장르의 영화를 즐겨 봅니다.",
  profileImage: "/images/default-profile.jpg",
  joinDate: "2024.12.01",
  favoriteGenres: ["액션", "SF", "드라마", "로맨스"],
  favoriteDirectors: ["크리스토퍼 놀란", "봉준호", "데미안 셔젤"]
};