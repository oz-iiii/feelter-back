/*import Image from "next/image";*/
import FeelterCheck from "@/components/main/FeelterCheck";
import FeelterGrid from "@/components/main/FeelterGrid";
import LatestSlide from "@/components/main/LatestSlide";
import Ranking from "@/components/main/Ranking";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-8">
      <h2 className="text-2xl font-semibold mb-8">| 당신의 지금</h2>
      <div className="w-full max-w-7xl">
        <FeelterCheck />
      </div>
      <div className="w-full max-w-7xl mt-4">
        <FeelterGrid />
      </div>
      <div className="w-full max-w-7xl">
        <LatestSlide />
      </div>
      <div className="w-full max-w-7xl">
        <h2 className="text-2xl font-semibold mt-8">
          | 인기순위&nbsp;&nbsp;&nbsp;
        </h2>
        <Ranking />
      </div>
    </div>
  );
}
