"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IoPlayCircleOutline } from "@react-icons/all-files/io5/IoPlayCircleOutline";
import { IoHeartOutline } from "@react-icons/all-files/io5/IoHeartOutline";
import { IoChatbubbleOutline } from "@react-icons/all-files/io5/IoChatbubbleOutline";
import { useMovieStore } from "@/lib/stores";

export default function LatestSlide() {
  const { movies, loading, fetchMovies } = useMovieStore();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  // 첫 번째 useEffect - 항상 실행되어야 함
  useEffect(() => {
    console.log("🔄 LatestSlide: useEffect running, calling fetchMovies");
    fetchMovies();
  }, []); // Remove fetchMovies from dependency array

  // 두 번째 useEffect - 항상 실행되어야 함 (조건부 return 이전에 배치)
  useEffect(() => {
    // loading 중이면 실행하지 않음
    if (loading || movies.length === 0) {
      return;
    }

    // 스트리밍 플랫폼별로 영화 그룹화
    const netflixMovies = movies.filter((movie) => movie.streaming === "Netflix");
    const disneyMovies = movies.filter((movie) => movie.streaming === "Disney+");
    const tvingMovies = movies.filter((movie) => movie.streaming === "Tving");

    const streamingGroups = [
      { name: "Netflix", movies: netflixMovies, color: "bg-red-600" },
      { name: "Disney+", movies: disneyMovies, color: "bg-blue-600" },
      { name: "Tving", movies: tvingMovies, color: "bg-green-600" },
    ].filter(group => group.movies.length > 0);

    const groupCount = streamingGroups.length;
    
    // Always reset currentGroupIndex if it's out of bounds
    if (groupCount > 0 && currentGroupIndex >= groupCount) {
      setCurrentGroupIndex(0);
      return;
    }
    
    // Only set up interval if we have more than one group
    if (groupCount > 1) {
      const interval = setInterval(() => {
        setCurrentGroupIndex((prev) => (prev + 1) % groupCount);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [movies.length, loading, currentGroupIndex]);

  const handlePlayClick = (movie: any) => {
    console.log(`플레이 버튼 클릭: ${movie.title}`);
    window.open(movie.streamingUrl, "_blank");
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-4">최신 업데이트</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">최신 영화를 불러오는 중...</div>
        </div>
      </section>
    );
  }

  // Debug logging
  console.log("🎬 LatestSlide - movies.length:", movies.length);
  console.log("🎬 LatestSlide - loading:", loading);
  console.log("🎬 LatestSlide - first movie:", movies[0]);

  // 스트리밍 플랫폼별로 영화 그룹화
  const netflixMovies = movies.filter((movie) => movie.streaming === "Netflix");
  const disneyMovies = movies.filter((movie) => movie.streaming === "Disney+");
  const tvingMovies = movies.filter((movie) => movie.streaming === "Tving");

  const streamingGroups = [
    { name: "Netflix", movies: netflixMovies, color: "bg-red-600" },
    { name: "Disney+", movies: disneyMovies, color: "bg-blue-600" },
    { name: "Tving", movies: tvingMovies, color: "bg-green-600" },
  ].filter(group => group.movies.length > 0);

  const currentGroup = streamingGroups[currentGroupIndex] || streamingGroups[0];
  const selectedMovie = currentGroup?.movies?.[0];

  if (!selectedMovie || streamingGroups.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-4">최신 업데이트</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">표시할 영화가 없습니다.</div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">최신 업데이트</h2>
      <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          <Image
            src={selectedMovie.bgUrl}
            alt={selectedMovie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* 콘텐츠 */}
        <div className="relative z-10 h-full flex">
          {/* 왼쪽: 영화 정보 */}
          <div className="flex-1 flex items-center p-8">
            <div className="text-white max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${currentGroup.color}`}
                >
                  {currentGroup.name}
                </div>
                <span className="text-sm text-gray-300">
                  {new Date(selectedMovie.release).getFullYear()}
                </span>
              </div>

              <h3 className="text-3xl font-bold mb-4">{selectedMovie.title}</h3>

              <div className="text-sm text-gray-300 mb-4">
                <p>
                  {selectedMovie.age} • {selectedMovie.runningTime} •{" "}
                  {selectedMovie.genre}
                </p>
                <p>
                  {selectedMovie.country} • 감독: {selectedMovie.director}
                </p>
              </div>

              <p className="text-sm text-gray-200 mb-6 line-clamp-3">
                {selectedMovie.overview}
              </p>

              {/* 액션 버튼들 */}
              <div className="flex gap-3">
                <button
                  onClick={() => handlePlayClick(selectedMovie)}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <IoPlayCircleOutline size={20} />
                  재생
                </button>
                <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                  <IoHeartOutline size={20} />찜
                </button>
                <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                  <IoChatbubbleOutline size={20} />
                  댓글
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 포스터 */}
          <div className="w-64 flex items-center justify-center p-8">
            <div className="w-48 h-72 bg-gray-300 rounded-lg overflow-hidden shadow-2xl relative">
              <Image
                src={selectedMovie.imgUrl}
                alt={selectedMovie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* 하단: 플랫폼 탭 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm">
          <div className="flex justify-center gap-4 p-4">
            {streamingGroups.map((group, index) => (
              <button
                key={group.name}
                onClick={() => setCurrentGroupIndex(index)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  currentGroupIndex === index
                    ? `${group.color} text-white`
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
