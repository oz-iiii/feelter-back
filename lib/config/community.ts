// 커뮤니티 서비스 설정
// USE_LOCAL_STORAGE를 true로 설정하면 로컬 스토리지 사용
// false로 설정하면 Supabase 사용

export const COMMUNITY_CONFIG = {
  // 로컬 스토리지 사용 여부 (개발 중에는 true, 프로덕션에서는 false)
  USE_LOCAL_STORAGE: false, // 이 값을 false로 바꾸면 Supabase 사용

  // 페이지네이션 설정
  DEFAULT_PAGE_SIZE: 20,

  // 로컬 스토리지 키
  STORAGE_KEYS: {
    POSTS: "feelter_community_posts",
    COMMENTS: "feelter_community_comments",
    CATS: "feelter_community_cats",
    EMOTIONS: "feelter_community_emotions",
  },
};

// 환경에 따른 자동 설정
if (typeof window !== "undefined") {
  // 개발 환경에서도 Supabase 사용하도록 변경
  // if (process.env.NODE_ENV === "development") {
  //   COMMUNITY_CONFIG.USE_LOCAL_STORAGE = true;
  // }

  // URL 파라미터로 강제 설정 가능 (?storage=supabase 또는 ?storage=local)
  const urlParams = new URLSearchParams(window.location.search);
  const storageType = urlParams.get("storage");
  if (storageType === "supabase") {
    COMMUNITY_CONFIG.USE_LOCAL_STORAGE = false;
  } else if (storageType === "local") {
    COMMUNITY_CONFIG.USE_LOCAL_STORAGE = true;
  }
}
