import { User } from "../types/user";
import { USER_KEYS } from "../../../../lib/keys";

export const defaultUser: User = {
  [USER_KEYS.id]: 1,
  [USER_KEYS.profileImage]: "/api/placeholder/150/150",
  [USER_KEYS.nickname]: "영화매니아",
  [USER_KEYS.email]: "moviemania@feelter.com",
  [USER_KEYS.bio]: "영화를 사랑하는 평범한 직장인입니다. 특히 SF와 스릴러 장르를 좋아해요!",
  [USER_KEYS.joinDate]: "2024.01.15",
  [USER_KEYS.favoriteGenres]: ["SF", "스릴러", "드라마"],
  [USER_KEYS.favoriteDirectors]: ["크리스토퍼 놀란", "봉준호", "데니스 빌럼브"],
};
