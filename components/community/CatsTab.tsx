"use client";

import { useState } from "react";

interface Cat {
  id: string;
  name: string;
  emoji: string;
  level: number;
  type: string;
  experience: number;
  maxExperience: number;
  description: string;
  specialty: string;
  achievements: string[];
  stats: {
    reviews: number;
    discussions: number;
    emotions: number;
  };
}

const mockCatData: Cat[] = [
  {
    id: "1",
    name: "나비",
    emoji: "🐱",
    level: 7,
    type: "영화평론가",
    experience: 70,
    maxExperience: 100,
    description: "리뷰 작성으로 성장 중인 똑똑한 고양이",
    specialty: "심도 있는 영화 분석",
    achievements: ["첫 리뷰 작성", "평점왕", "베스트 리뷰어"],
    stats: {
      reviews: 23,
      discussions: 8,
      emotions: 12,
    },
  },
  {
    id: "2",
    name: "토토",
    emoji: "😺",
    level: 5,
    type: "토론왕",
    experience: 45,
    maxExperience: 100,
    description: "열정적인 토론으로 레벨업!",
    specialty: "활발한 커뮤니티 참여",
    achievements: ["토론 마스터", "댓글왕", "인기글 작성자"],
    stats: {
      reviews: 12,
      discussions: 34,
      emotions: 6,
    },
  },
  {
    id: "3",
    name: "달키",
    emoji: "😸",
    level: 3,
    type: "감정표현가",
    experience: 30,
    maxExperience: 100,
    description: "감정 기록을 통해 천천히 성장 중",
    specialty: "섬세한 감정 표현",
    achievements: ["감정일기왕", "공감능력자"],
    stats: {
      reviews: 5,
      discussions: 2,
      emotions: 28,
    },
  },
];

export default function CatsTab() {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);

  const getProgressColor = (level: number) => {
    if (level >= 7) return "from-purple-500 to-pink-500";
    if (level >= 5) return "from-blue-500 to-cyan-500";
    if (level >= 3) return "from-green-500 to-blue-500";
    return "from-gray-500 to-gray-400";
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 7) return "from-purple-500 to-pink-500";
    if (level >= 5) return "from-blue-500 to-cyan-500";
    if (level >= 3) return "from-green-500 to-blue-500";
    return "from-gray-500 to-gray-400";
  };

  const handleCatClick = (cat: Cat) => {
    setSelectedCat(cat);
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl lg:text-4xl font-bold mb-4"
          style={{ color: "#CCFF00" }}
        >
          나의 고양이 식구들
        </h1>
        <p className="text-gray-400 text-lg">
          영화 리뷰와 함께 성장하는 귀여운 친구들
        </p>
      </div>

      {/* Cat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mockCatData.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCatClick(cat)}
            className="bg-gray-800 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-sm
                       cursor-pointer transition-all duration-300 hover:-translate-y-2 
                       hover:shadow-lg"
          >
            {/* Cat Avatar */}
            <div className="text-center mb-4">
              <div className="text-6xl mb-3 animate-bounce">{cat.emoji}</div>
              <h3 className="text-xl font-bold text-white mb-2">{cat.name}</h3>
              <div
                className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getLevelBadgeColor(
                  cat.level
                )} text-black font-bold text-sm`}
              >
                Lv.{cat.level} {cat.type}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>경험치</span>
                <span>
                  {cat.experience}/{cat.maxExperience}
                </span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor(
                    cat.level
                  )} rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: `${(cat.experience / cat.maxExperience) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm text-center mb-4">
              {cat.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded-lg py-2">
                <div className="font-bold" style={{ color: "#CCFF00" }}>
                  {cat.stats.reviews}
                </div>
                <div className="text-xs text-gray-400">리뷰</div>
              </div>
              <div className="bg-white/10 rounded-lg py-2">
                <div className="text-blue-400 font-bold">
                  {cat.stats.discussions}
                </div>
                <div className="text-xs text-gray-400">토론</div>
              </div>
              <div className="bg-white/10 rounded-lg py-2">
                <div className="text-pink-400 font-bold">
                  {cat.stats.emotions}
                </div>
                <div className="text-xs text-gray-400">감정</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cat Detail Modal */}
      {selectedCat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-sm">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCat(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 
                         rounded-full flex items-center justify-center text-gray-400 hover:text-white"
            >
              ✕
            </button>

            {/* Cat Details */}
            <div className="text-center mb-6">
              <div className="text-8xl mb-4">{selectedCat.emoji}</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedCat.name}
              </h2>
              <div
                className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${getLevelBadgeColor(
                  selectedCat.level
                )} text-black font-bold`}
              >
                Level {selectedCat.level} {selectedCat.type}
              </div>
            </div>

            {/* Specialty */}
            <div className="mb-6">
              <h3 className="font-bold mb-2" style={{ color: "#CCFF00" }}>
                특기
              </h3>
              <p className="text-gray-300 bg-white/5 rounded-lg p-3">
                {selectedCat.specialty}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <h3 className="font-bold mb-2" style={{ color: "#CCFF00" }}>
                성장 현황
              </h3>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>경험치</span>
                  <span>
                    {selectedCat.experience}/{selectedCat.maxExperience}
                  </span>
                </div>
                <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor(
                      selectedCat.level
                    )} rounded-full transition-all duration-1000`}
                    style={{
                      width: `${
                        (selectedCat.experience / selectedCat.maxExperience) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  다음 레벨까지{" "}
                  {selectedCat.maxExperience - selectedCat.experience} 경험치
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-6">
              <h3 className="font-bold mb-3" style={{ color: "#CCFF00" }}>
                획득한 업적
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCat.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
                               border border-yellow-500/30 px-3 py-1 rounded-full text-sm text-yellow-300"
                  >
                    🏆 {achievement}
                  </span>
                ))}
              </div>
            </div>

            {/* Detailed Stats */}
            <div>
              <h3 className="font-bold mb-3" style={{ color: "#CCFF00" }}>
                상세 활동
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "#CCFF00" }}
                  >
                    {selectedCat.stats.reviews}
                  </div>
                  <div className="text-sm text-gray-400">작성한 리뷰</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedCat.stats.discussions}
                  </div>
                  <div className="text-sm text-gray-400">참여한 토론</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-pink-400">
                    {selectedCat.stats.emotions}
                  </div>
                  <div className="text-sm text-gray-400">감정 기록</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-800 border border-white/10 rounded-2xl p-6 shadow-sm">
        <h3
          className="text-lg font-bold mb-3 flex items-center gap-2"
          style={{ color: "#CCFF00" }}
        >
          💡 성장 팁
        </h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• 리뷰를 작성하면 고양이가 빠르게 성장합니다</p>
          <p>• 토론에 참여하면 커뮤니케이션 능력이 향상됩니다</p>
          <p>• 감정 기록을 통해 감성 지능을 개발할 수 있습니다</p>
          <p>• 꾸준한 활동이 고양이 성장의 핵심입니다</p>
        </div>
      </div>
    </div>
  );
}
