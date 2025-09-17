"use client";

import { useAuth } from "@/hooks/useAuth";

interface FilterSidebarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  onShowMyPosts?: () => void;
  onShowAllPosts?: () => void;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onSignOut?: () => void;
  showMyPosts?: boolean;
}

const sortOptions = ["최신순", "인기순", "댓글순"];

export default function FilterSidebar({
  sortBy,
  onSortChange,
  onShowMyPosts,
  onShowAllPosts,
  onOpenSignIn,
  onOpenSignUp,
  onSignOut,
  showMyPosts = false,
}: FilterSidebarProps) {
  const { user } = useAuth();
  return (
    <div className="sticky top-40 space-y-6">
      {/* User Summary */}
      <div className="bg-gray-800 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="text-center">
          {user ? (
            <>
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 
                              flex items-center justify-center text-2xl font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #CCFF00 0%, #99CC00 100%)",
                  color: "#111111",
                }}
              >
                {user.nickname?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">
                {user.nickname || user.email?.split("@")[0] || "사용자"}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{user.email}</p>
              <div
                className="flex items-center justify-center gap-2 mb-4 
                              rounded-full px-3 py-1"
                style={{ backgroundColor: "rgba(204, 255, 0, 0.2)" }}
              >
                <span>🐱</span>
                <span className="text-sm" style={{ color: "#CCFF00" }}>
                  Lv.5 털뭉치
                </span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={showMyPosts ? onShowAllPosts : onShowMyPosts}
                  className={`w-full py-2 px-3 rounded-lg text-sm transition-all duration-300 ${
                    showMyPosts ? "text-black" : "text-white"
                  }`}
                  style={{
                    backgroundColor: showMyPosts
                      ? "#CCFF00"
                      : "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {showMyPosts ? "전체 게시글 보기" : "내 활동 보기"}
                </button>
                <button
                  className="w-full py-2 px-3 hover:bg-white/20 
                                 rounded-lg text-sm transition-all duration-300 text-white"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  프로필 편집
                </button>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 
                                   rounded-lg text-sm transition-all duration-300 text-white"
                  >
                    로그아웃
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 
                              flex items-center justify-center text-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #CCFF00 0%, #99CC00 100%)",
                  color: "#111111",
                }}
              >
                👤
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">게스트</h3>
              <p className="text-gray-400 text-sm mb-4">
                로그인하여 더 많은 기능을 이용해보세요
              </p>
              <div className="space-y-2">
                <button
                  onClick={onOpenSignIn}
                  className="w-full py-2 px-3 hover:bg-white/20 
                                 rounded-lg text-sm transition-all duration-300 text-white"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  로그인
                </button>
                <button
                  onClick={onOpenSignUp}
                  className="w-full py-2 px-3 rounded-lg text-sm transition-all duration-300 text-black"
                  style={{ backgroundColor: "#CCFF00" }}
                >
                  회원가입
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-gray-800 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold mb-4" style={{ color: "#CCFF00" }}>
          정렬
        </h3>
        <div className="space-y-2">
          {sortOptions.map((sort) => (
            <button
              key={sort}
              onClick={() => onSortChange(sort)}
              className={`
                w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-300
                ${
                  sortBy === sort
                    ? "text-black"
                    : "text-gray-300 hover:text-white"
                }
              `}
              style={{
                backgroundColor:
                  sortBy === sort ? "#CCFF00" : "rgba(255, 255, 255, 0.1)",
              }}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
