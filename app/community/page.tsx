"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CommunityTabs from "@/components/community/CommunityTabs";
import FeedTab from "@/components/community/FeedTab";
import DiscussionTab from "@/components/community/DiscussionTab";
import ReviewTab from "@/components/community/ReviewTab";
import CatsTab from "@/components/community/CatsTab";
import EmotionsTab from "@/components/community/EmotionsTab";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("feed");
  const router = useRouter();

  const handleCreatePost = () => {
    router.push("/community/create");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "feed":
        return <FeedTab onCreatePost={handleCreatePost} />;
      case "discussion":
        return <DiscussionTab onCreatePost={handleCreatePost} />;
      case "review":
        return <ReviewTab onCreatePost={handleCreatePost} />;
      case "cats":
        return <CatsTab />;
      case "emotions":
        return <EmotionsTab onCreatePost={handleCreatePost} />;
      default:
        return <FeedTab onCreatePost={handleCreatePost} />;
    }
  };

  return (
    <main
      className="min-h-screen pt-[130px] px-4 lg:px-10"
      style={{ backgroundColor: "#111111" }}
    >
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
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
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="max-w-7xl mx-auto">
        <CommunityTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-8">{renderActiveTab()}</div>

      {/* Floating Action Button */}
      <button
        onClick={handleCreatePost}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-50 flex items-center justify-center"
        style={{
          backgroundColor: "#CCFF00",
          color: "#111111",
        }}
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
    </main>
  );
}
