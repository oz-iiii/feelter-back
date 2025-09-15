"use client";

import React from "react";
import { BiX } from "react-icons/bi";
import { useFilter } from "@/lib/contexts/FilterContext";
import { FilterState } from "@/lib/types/filter";

const ActiveFilters: React.FC = () => {
  const { platforms, genres, years, ratings, removeFilter, clearFilters, hasActiveFilters } = useFilter();

  if (!hasActiveFilters()) {
    return null;
  }

  const renderFilterTags = (category: keyof FilterState, items: string[], label: string) => {
    if (items.length === 0) return null;

    return items.map((item) => (
      <div
        key={`${category}-${item}`}
        className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-sm border border-sky-500/30"
      >
        <span className="text-xs opacity-70">{label}:</span>
        <span>{item}</span>
        <button
          onClick={() => removeFilter(category, item)}
          className="ml-1 hover:text-white transition-colors"
          aria-label={`${item} 필터 제거`}
        >
          <BiX size={16} />
        </button>
      </div>
    ));
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">적용된 필터</h3>
        <button
          onClick={clearFilters}
          className="text-sky-400 hover:text-white text-sm transition-colors"
        >
          모두 지우기
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {renderFilterTags("platforms", platforms, "플랫폼")}
        {renderFilterTags("genres", genres, "장르")}
        {renderFilterTags("years", years, "연도")}
        {renderFilterTags("ratings", ratings, "평점")}
      </div>
    </div>
  );
};

export default ActiveFilters;