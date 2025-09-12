"use client";

import { OTT_PLATFORMS } from "@/lib/constants/ottPlatforms";

interface OttPlatformDisplayProps {
  selectedPlatformIds: string[];
  variant?: "dashboard" | "profile";
  maxDisplay?: number;
}

export default function OttPlatformDisplay({ 
  selectedPlatformIds, 
  variant = "dashboard",
  maxDisplay = 6 
}: OttPlatformDisplayProps) {
  const selectedPlatforms = OTT_PLATFORMS.filter(platform => 
    selectedPlatformIds.includes(platform.id)
  );

  if (selectedPlatforms.length === 0) {
    if (variant === "profile") {
      return (
        <span className="px-3 py-1 border border-gray-600 text-gray-400 text-sm rounded-full">
          구독중인 OTT 플랫폼이 없습니다
        </span>
      );
    }
    return null;
  }

  const displayPlatforms = selectedPlatforms.slice(0, maxDisplay);
  const remainingCount = selectedPlatforms.length - maxDisplay;

  if (variant === "profile") {
    return (
      <div className="flex flex-wrap gap-2">
        {displayPlatforms.map((platform) => (
          <span 
            key={platform.id} 
            className="px-3 py-1 bg-neutral-800 text-white text-sm rounded-full"
          >
            {platform.name}
          </span>
        ))}
      </div>
    );
  }

  // dashboard variant
  return (
    <>
      {displayPlatforms.map((platform) => (
        <span 
          key={platform.id} 
          className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-gray-300"
        >
          {platform.name}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-gray-300">
          +{remainingCount}
        </span>
      )}
    </>
  );
}