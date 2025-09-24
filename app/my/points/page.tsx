"use client";

import { useState } from "react";
import MyLayout from "@/components/my/MyLayout";
import { usePointStore } from "@/lib/stores";

export default function PointsPage() {
	const { currentPoints, getTotalEarned, getTotalUsed, getFilteredHistory } =
		usePointStore();

	const [filter, setFilter] = useState("all");

	const filteredHistory = getFilteredHistory(filter);
	const totalEarned = getTotalEarned();
	const totalUsed = getTotalUsed();

	return (
		<MyLayout>
			<div className="w-full max-w-4xl mx-auto px-4 pb-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center space-x-4">
						<h1 className="text-3xl font-bold text-white">포인트 관리</h1>
					</div>
				</div>

				{/* Points Summary */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
					<div
						className="bg-neutral-900 rounded-lg
						inset-shadow-xs inset-shadow-white/30
						shadow-xs shadow-white/30 p-6"
					>
						<h3 className="text-lg font-semibold text-white mb-2">
							현재 포인트
						</h3>
						<p className="text-3xl font-bold text-[#ccff00]">
							{currentPoints.toLocaleString()}P
						</p>
					</div>

					<div
						className="bg-neutral-900 rounded-lg
						inset-shadow-xs inset-shadow-white/30
						shadow-xs shadow-white/30 p-6"
					>
						<h3 className="text-lg font-semibold text-white mb-2">총 적립</h3>
						<p className="text-3xl font-bold text-green-600">
							+{totalEarned.toLocaleString()}P
						</p>
					</div>

					<div
						className="bg-neutral-900 rounded-lg
						inset-shadow-xs inset-shadow-white/30
						shadow-xs shadow-white/30 p-6"
					>
						<h3 className="text-lg font-semibold text-white mb-2">총 사용</h3>
						<p className="text-3xl font-bold text-red-600">
							-{totalUsed.toLocaleString()}P
						</p>
					</div>
				</div>

				{/* Point Earning Methods */}
				<div
					className="bg-neutral-900 rounded-lg
					inset-shadow-xs inset-shadow-white/30
					shadow-xs shadow-white/30 p-6 mb-8"
				>
					<h2 className="text-xl font-semibold text-white mb-4">
						포인트 적립 방법
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-medium text-white">영화 리뷰 작성</h3>
									<p className="text-sm text-gray-400">
										상세한 리뷰를 작성하세요
									</p>
								</div>
								<span className="text-green-600 font-bold">+100P</span>
							</div>
						</div>

						<div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-medium text-white">영화 평점 등록</h3>
									<p className="text-sm text-gray-400">
										시청한 영화에 평점을 주세요
									</p>
								</div>
								<span className="text-green-600 font-bold">+50P</span>
							</div>
						</div>

						<div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-medium text-white">영화 추천</h3>
									<p className="text-sm text-gray-400">
										다른 사용자에게 영화 추천
									</p>
								</div>
								<span className="text-green-600 font-bold">+250P</span>
							</div>
						</div>

						<div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-medium text-white">로그인 보상</h3>
									<p className="text-sm text-gray-400">
										매일 로그인하면 적립됩니다
									</p>
								</div>
								<span className="text-green-600 font-bold">+10P</span>
							</div>
						</div>
					</div>
				</div>

				{/* History Section */}
				<div
					className="bg-neutral-900 rounded-lg
					inset-shadow-xs inset-shadow-white/30
					shadow-xs shadow-white/30"
				>
					<div className="p-6 border-b border-neutral-700">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-white">포인트 내역</h2>
							<select
								value={filter}
								onChange={(e) => setFilter(e.target.value)}
								className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
							>
								<option value="all">전체</option>
								<option value="earn">적립</option>
								<option value="use">사용</option>
							</select>
						</div>
					</div>

					<div className="divide-y divide-neutral-700">
						{filteredHistory.map((item) => (
							<div
								key={item.id}
								className="p-6 hover:bg-neutral-800 transition-colors"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-start space-x-4">
										<div
											className={`p-2 rounded-lg ${
												item.type === "earn" ? "bg-green-900" : "bg-red-900"
											}`}
										>
											{item.type === "earn" ? (
												<svg
													className="w-5 h-5 text-green-300"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
											) : (
												<svg
													className="w-5 h-5 text-red-300"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M20 12H4"
													/>
												</svg>
											)}
										</div>
										<div>
											<h3 className="font-medium text-white">
												{item.description}
											</h3>
											{item.movieTitle && (
												<p className="text-sm text-gray-400">
													영화: {item.movieTitle}
												</p>
											)}
											<p className="text-sm text-gray-500">{item.date}</p>
										</div>
									</div>
									<div
										className={`text-lg font-bold ${
											item.type === "earn" ? "text-green-600" : "text-red-600"
										}`}
									>
										{item.type === "earn" ? "+" : ""}
										{item.amount.toLocaleString()} P
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</MyLayout>
	);
}
