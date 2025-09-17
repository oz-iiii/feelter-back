"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import CommunityTabs from "@/components/community/CommunityTabs";
import FeedTab from "@/components/community/FeedTab";
import DiscussionTab from "@/components/community/DiscussionTab";
import ReviewTab from "@/components/community/ReviewTab";
import CatsTab from "@/components/community/CatsTab";
import EmotionsTab from "@/components/community/EmotionsTab";
import SignInModal from "@/components/auth/SignInModal";
import SignUpModal from "@/components/auth/SignUpModal";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("feed");
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // URL에서 refresh 파라미터 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("refresh") === "true") {
      // URL에서 refresh 파라미터 제거
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [router]);

  const handleCreatePost = () => {
    if (!user) {
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 3000);
      return;
    }
    router.push("/community/create");
  };

  const handleOpenSignIn = () => {
    setShowSignInModal(true);
    setShowSignUpModal(false);
  };

  const handleOpenSignUp = () => {
    setShowSignUpModal(true);
    setShowSignInModal(false);
  };

  const handleCloseModals = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
  };

  // 로딩 중일 때 표시할 스켈레톤 UI
  if (loading) {
    return (
      <main
        className="min-h-screen pt-[130px] px-4 lg:px-10"
        style={{ backgroundColor: "#111111" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-64 h-16 mx-auto mb-4 rounded-lg animate-pulse bg-gray-700"></div>
            <div className="w-96 h-8 mx-auto rounded-lg animate-pulse bg-gray-700"></div>
          </div>
          <div className="w-full h-64 rounded-lg animate-pulse bg-gray-700"></div>
        </div>
      </main>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "feed":
        return (
          <FeedTab
            onCreatePost={handleCreatePost}
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
          />
        );
      case "discussion":
        return (
          <DiscussionTab
            onCreatePost={handleCreatePost}
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
          />
        );
      case "review":
        return (
          <ReviewTab
            onCreatePost={handleCreatePost}
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
          />
        );
      case "cats":
        return <CatsTab />;
      case "emotions":
        return <EmotionsTab onCreatePost={handleCreatePost} />;
      default:
        return (
          <FeedTab
            onCreatePost={handleCreatePost}
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
          />
        );
    }
  };

  return (
    <main
      className="min-h-screen pt-[30px] px-4 lg:px-10"
      style={{ backgroundColor: "#111111" }}
    >
      {/* Header Section */}
      {/* 이 div를 relative로 만들어서 안에 absolute 요소를 배치할 수 있게 함*/}
      <div className="max-w-7xl mx-auto mb-8 relative">
        {/* 이 div는 가운데 정렬을 위해 mx-auto와 text-center를 유지*/}
        {/* Page Header - 게시판별로 다른 헤더 표시 */}
        <div className="text-center mb-8">
          {activeTab === "feed" && (
            <>
              <h1
                className="text-4xl lg:text-6xl font-bold mb-4"
                style={{ color: "#CCFF00" }}
              >
                커뮤니티
              </h1>
              <p
                className="text-lg lg:text-xl opacity-80"
                style={{ color: "#CCFF00" }}
              >
                함께 이야기하고 공유하는 공간
              </p>
            </>
          )}
          {activeTab === "discussion" && (
            <>
              <h1
                className="text-4xl lg:text-6xl font-bold mb-4"
                style={{ color: "#CCFF00" }}
              >
                토론 게시판
              </h1>
              <p
                className="text-lg lg:text-xl opacity-80"
                style={{ color: "#CCFF00" }}
              >
                영화와 드라마에 대한 다양한 의견을 나누어보세요
              </p>
            </>
          )}
          {activeTab === "review" && (
            <>
              <h1
                className="text-4xl lg:text-6xl font-bold mb-4"
                style={{ color: "#CCFF00" }}
              >
                리뷰 광장
              </h1>
              <p
                className="text-lg lg:text-xl opacity-80"
                style={{ color: "#CCFF00" }}
              >
                솔직하고 다양한 영화 리뷰를 만나보세요
              </p>
            </>
          )}
          {activeTab === "emotions" && (
            <>
              <h1
                className="text-4xl lg:text-6xl font-bold mb-4"
                style={{ color: "#CCFF00" }}
              >
                나의 감정 기록실
              </h1>
              <p
                className="text-lg lg:text-xl opacity-80"
                style={{ color: "#CCFF00" }}
              >
                영화로 느낀 감정들을 기록하고 추억해보세요
              </p>
            </>
          )}
          {activeTab === "cats" && (
            <>
              <h1
                className="text-4xl lg:text-6xl font-bold mb-4"
                style={{ color: "#CCFF00" }}
              >
                나의 고양이 식구들
              </h1>
              <p
                className="text-lg lg:text-xl opacity-80"
                style={{ color: "#CCFF00" }}
              >
                영화 리뷰와 함께 성장하는 귀여운 친구들
              </p>
            </>
          )}
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="max-w-7xl mx-auto">
        <CommunityTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-8">{renderActiveTab()}</div>

      {/* Login Message */}
      {showLoginMessage && (
        <div className="fixed top-[140px] left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
            글을 작성하려면 먼저 로그인해주세요!
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleCreatePost}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-50 flex items-center justify-center ${
          !user ? "opacity-75" : ""
        }`}
        style={{
          backgroundColor: "#CCFF00",
          color: "#111111",
        }}
        title={!user ? "로그인이 필요합니다" : "새 글 작성하기"}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Authentication Modals */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={handleCloseModals}
        onSwitchToSignUp={handleOpenSignUp}
      />
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={handleCloseModals}
        onSwitchToSignIn={handleOpenSignIn}
      />
    </main>
  );
}
