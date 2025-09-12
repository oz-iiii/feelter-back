'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  BiPlayCircle,
  BiPlusCircle,
  BiShareAlt,
  BiX,
  BiChevronDown,
  BiChevronUp,
} from 'react-icons/bi';
import { ContentItem } from '@/lib/data';
import { useMovieStore } from '@/lib/stores';
import { Movie } from '@/lib/types/movie';

interface MovieModalProps {
  content: ContentItem | null;
  onClose: () => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ content, onClose }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { movies } = useMovieStore();

  // ContentItem에서 해당하는 Movie 데이터 찾기
  const findMovieByTitle = (title: string): Movie | null => {
    return movies.find(movie => movie.title === title) || null;
  };

  const movieData = content ? findMovieByTitle(content.title) : null;

  const descriptionText =
    movieData?.overview || 
    content?.description ||
    '이 영화에 대한 설명이 아직 없습니다. 하지만 분명 멋진 영화일 겁니다!';

  const showReadMore = descriptionText.length > 150;

  const displayedDescription =
    isDescriptionExpanded || !showReadMore
      ? descriptionText
      : `${descriptionText.substring(0, 150)}...`;

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="bg-[#181818] w-full max-w-7xl h-5/6 overflow-y-auto rounded-lg shadow-xl relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-20"
              aria-label="Close modal"
            >
              <BiX size={32} />
            </button>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 h-full">
              {/* Left Column: Poster and Info */}
              <div className="relative h-full flex flex-col justify-end">
                <div className="absolute inset-0">
                  <Image
                    src={content.poster || "/images/placeholder.jpg"}
                    alt={content.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="opacity-40 rounded-l-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/80 to-transparent" />
                </div>

                <div className="relative p-6 md:p-10 space-y-4">
                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)]">
                    {content.title}
                  </h1>

                  {/* Buttons */}
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition">
                      <BiPlayCircle size={24} />
                      <span>재생</span>
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition">
                      <BiPlusCircle size={24} />
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition">
                      <BiShareAlt size={24} />
                    </button>
                  </div>

                  {/* Basic Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-300 pt-2">
                    <span>{content.year}</span>
                    <span>{movieData?.runningTime || "120분"}</span>
                    <span className="flex items-center gap-1 border px-1 rounded">
                      {movieData?.age || "전체관람가"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="p-6 md:p-10 flex flex-col justify-end h-full">
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <p className="text-xl text-gray-200">
                      {displayedDescription}
                    </p>
                    {showReadMore && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="flex items-center gap-1 text-gray-400 hover:text-white mt-2 text-sm"
                      >
                        <span>
                          {isDescriptionExpanded ? '간략히' : '상세보기'}
                        </span>
                        {isDescriptionExpanded ? (
                          <BiChevronUp />
                        ) : (
                          <BiChevronDown />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Cast */}
                  <div>
                    <h3 className="text-lg text-gray-400">출연진</h3>
                    <p className="text-xl text-gray-200">
                      {movieData?.actor 
                        ? (Array.isArray(movieData.actor) 
                           ? movieData.actor.join(", ") 
                           : movieData.actor)
                        : "정보 없음"
                      }
                    </p>
                  </div>

                  {/* Genre */}
                  <div>
                    <h3 className="text-lg text-gray-400">장르</h3>
                    <p className="text-xl text-gray-200">
                      {movieData?.genre 
                        ? (Array.isArray(movieData.genre) 
                           ? movieData.genre.join(", ") 
                           : movieData.genre)
                        : (content.genre || "기타")
                      }
                    </p>
                  </div>

                  {/* Director */}
                  <div>
                    <h3 className="text-lg text-gray-400">감독</h3>
                    <p className="text-xl text-gray-200">
                      {movieData?.director 
                        ? (Array.isArray(movieData.director) 
                           ? movieData.director.join(", ") 
                           : movieData.director)
                        : "정보 없음"
                      }
                    </p>
                  </div>

                  {/* Feelter Tags */}
                  <div>
                    <h3 className="text-lg text-gray-400">시리즈 특징</h3>
                    <p className="text-xl text-gray-200">
                      {movieData 
                        ? [
                            Array.isArray(movieData.feelterTime) ? movieData.feelterTime.join(", ") : movieData.feelterTime,
                            Array.isArray(movieData.feelterPurpose) ? movieData.feelterPurpose.join(", ") : movieData.feelterPurpose,
                            Array.isArray(movieData.feelterOccasion) ? movieData.feelterOccasion.join(", ") : movieData.feelterOccasion
                          ].filter(Boolean).join(" • ")
                        : "액션, 드라마, 스릴러"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MovieModal;