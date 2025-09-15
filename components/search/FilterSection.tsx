"use client";

import React from "react";
import { useFilter } from "@/lib/contexts/FilterContext";
import { FilterState } from "@/lib/types/filter";

interface FilterSectionProps {
  title: string;
  category: keyof FilterState;
  data: string[];
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, category, data }) => {
  const filter = useFilter();
  const selectedItems = filter[category];

  const handleCheckboxChange = (label: string) => {
    filter.toggleFilter(category, label);
  };

  return (
    <section>
      <h3 className="text-lg font-bold text-gray-200 mb-3 px-2">{title}</h3>
      <div className="space-y-1">
        {data?.map((label, index) => (
          <label
            key={index}
            className="flex items-center gap-3 px-3 py-2 text-gray-300 rounded-md cursor-pointer hover:bg-gray-800 transition-colors duration-200"
          >
            <input
              type="checkbox"
              className="w-4 h-4 text-lime-400 bg-gray-700 rounded border-gray-600 focus:ring-lime-500 focus:ring-offset-gray-900"
              checked={selectedItems.includes(label)}
              onChange={() => handleCheckboxChange(label)}
            />
            <span>{label}</span>
          </label>
        )) || <div className="text-gray-500 px-3 py-2">데이터가 없습니다.</div>}
      </div>
    </section>
  );
};

export default FilterSection;
