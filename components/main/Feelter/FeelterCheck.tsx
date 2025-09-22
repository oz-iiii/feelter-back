"use client";

import React, { useState } from "react";
import FeelterGrid from "./FeelterGrid";

type FilterData = {
  time: string[];
  purpose: string[];
  occasion: string[];
};

export default function FeelterCheck() {
  const [filters] = useState<FilterData>({
    time: ["이동", "취침", "식사", "심심", "휴일/주말"],
    purpose: ["감동", "설렘", "웃음", "몰입", "통쾌"],
    occasion: ["혼자", "연인", "친구", "가족", "아이"],
  });

  const [selectedFilters, setSelectedFilters] = useState<{
    time: string;
    purpose: string;
    occasion: string;
  }>({
    time: "심심",
    purpose: "통쾌",
    occasion: "혼자",
  });

  const handleFilterClick = (category: keyof FilterData, item: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category] === item ? "" : item,
    }));
  };

  const renderFilterSection = (
    category: keyof FilterData,
    items: string[],
    title: string
  ) => (
    <section key={category} className="mb-3 min-w-[200px] w-full">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {/* 슬라이더 바 효과를 내는 컨테이너 */}
      <div className="flex flex-nowrap overflow-x-auto justify-between p-1 rounded-full bg-gray-200/50">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => handleFilterClick(category, item)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full transition-colors duration-200
              ${
                selectedFilters[category] === item
                  ? "bg-black text-white"
                  : "bg-transparent text-gray-800"
              }
            `}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <>
      <div
        className="bg-[url('https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/wyCQovekJ10HnmqCE3lPNaoGDde.jpg')] 
      bg-cover bg-center bg-no-repeat w-full max-w-7xl"
      >
        <div className="flex flex-col gap-4 max-w-[500px] w-full">
          {renderFilterSection("time", filters.time, "Time")}
          {renderFilterSection("purpose", filters.purpose, "Purpose")}
          {renderFilterSection("occasion", filters.occasion, "Occasion")}
        </div>
      </div>
      <FeelterGrid filters={selectedFilters} />
    </>
  );
}
