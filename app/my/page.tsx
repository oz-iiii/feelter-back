"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import MyLayout from "@/components/my/MyLayout";
import { useFavoriteStore, useWatchHistoryStore } from "@/lib/stores";
import { useAuth } from "@/hooks/useAuth";
import SignInModal from "@/components/auth/SignInModal";
import SignUpModal from "@/components/auth/SignUpModal";
import { getOttPlatformsByIds } from "@/lib/constants/ottPlatforms";

export default function MyPage() {
	const { favorites, removeFromFavorites } = useFavoriteStore();
	const { getRecentHistory } = useWatchHistoryStore();
	const { user } = useAuth();
	
	// 모달 상태 관리
	const [showSignInModal, setShowSignInModal] = useState(false);
	const [showSignUpModal, setShowSignUpModal] = useState(false);

	// 최근 시청 이력 3개 가져오기
	const watchHistory = user ? getRecentHistory(3) : [];

	// 대시보드에서 보여줄 최근 즐겨찾기 3개만 가져오기
	const recentFavorites = favorites.slice(0, 3);

	// 선택된 OTT 플랫폼 정보 가져오기
	const selectedOttPlatforms = user?.selectedOttPlatforms ? getOttPlatformsByIds(user.selectedOttPlatforms) : [];

	// 비회원 상태일 때 로그인 안내 화면 표시
	if (!user) {
		return (
			<>
				<MyLayout>
					<div className="w-full max-w-4xl mx-auto px-4 pb-8">
						<div className="bg-neutral-900 rounded-lg inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 p-8 text-center">
							<svg
								className="w-16 h-16 text-gray-400 mx-auto mb-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							<h2 className="text-2xl font-bold text-white mb-4">로그인이 필요합니다</h2>
							<p className="text-gray-400 mb-6">
								마이페이지를 이용하려면 로그인해주세요.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<button 
									onClick={() => setShowSignInModal(true)}
									className="px-6 py-3 bg-[#DDE66E] hover:bg-[#b8e600] text-black rounded-lg transition-colors font-medium"
								>
									로그인
								</button>
								<button 
									onClick={() => setShowSignUpModal(true)}
									className="px-6 py-3 bg-neutral-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
								>
									회원가입
								</button>
							</div>
						</div>
					</div>
				</MyLayout>

				{/* 로그인 모달 */}
				<SignInModal
					isOpen={showSignInModal}
					onClose={() => setShowSignInModal(false)}
					onSwitchToSignUp={() => {
						setShowSignInModal(false);
						setShowSignUpModal(true);
					}}
				/>

				{/* 회원가입 모달 */}
				<SignUpModal
					isOpen={showSignUpModal}
					onClose={() => setShowSignUpModal(false)}
					onSwitchToSignIn={() => {
						setShowSignUpModal(false);
						setShowSignInModal(true);
					}}
				/>
			</>
		);
	}

	return (
		<>
			<MyLayout>
				<div className="w-full max-w-4xl mx-auto px-4 pb-8">
				{/* Profile Section */}
				<div
					className="bg-neutral-900 rounded-lg 
            inset-shadow-xs inset-shadow-white/30
            shadow-xs shadow-white/30 p-6 mb-4"
				>
					<div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
						{/* Profile Image */}
						<div>
							<div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-gray-200 flex items-center justify-center">
								{user.profile_image ? (
									<Image
										src={user.profile_image}
										alt="프로필 이미지"
										width={96}
										height={96}
										className="w-24 h-24 rounded-full object-cover"
									/>
								) : (
									<svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
									</svg>
								)}
							</div>
						</div>

						{/* Profile Info */}
						<div className="text-center md:text-left flex-1">
							<h1 className="text-2xl font-bold text-white mb-2">
								{user.nickname || user.email?.split('@')[0] || "사용자"}
							</h1>
							<p className="text-gray-400 mb-2">이메일: {user.email}</p>
							{selectedOttPlatforms.length > 0 && (
								<div className="mb-4">
									<p className="text-sm text-gray-500 mb-2">구독중인 OTT: {selectedOttPlatforms.length}개</p>
									<div className="flex flex-wrap gap-1">
										{selectedOttPlatforms.slice(0, 6).map((platform) => (
											<span key={platform.id} className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-gray-300">
												{platform.logo} {platform.name}
											</span>
										))}
										{selectedOttPlatforms.length > 6 && (
											<span className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-gray-300">
												+{selectedOttPlatforms.length - 6}
											</span>
										)}
									</div>
								</div>
							)}
							<Link
								href="/my/profile"
								className="inline-flex items-center px-4 py-2 bg-[#DDE66E] hover:bg-[#b8e600] text-black rounded-lg transition-colors"
							>
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								</svg>
								프로필 편집
							</Link>
						</div>
					</div>
				</div>

				{/* Points Section */}
				<div
					className="bg-neutral-900 rounded-lg
            inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 p-6 mb-4"
				>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl font-semibold text-white mb-2">
								내 포인트
							</h2>
							<p className="text-3xl font-bold text-[#b8e600]">
								{user.points?.toLocaleString() || 0} P
							</p>
						</div>
						<div className="flex space-x-3">
							<Link
								href="/my/points"
								className="px-4 py-2 bg-neutral-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
							>
								포인트 내역
							</Link>
							<button className="px-4 py-2 bg-[#DDE66E] hover:bg-[#b8e600] text-black rounded-lg transition-colors">
								포인트 사용
							</button>
						</div>
					</div>
				</div>

				{/* Grid Layout for History and Favorites */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Watch History */}
					<div
						className="bg-neutral-900 rounded-lg 
              inset-shadow-xs inset-shadow-white/30
              shadow-xs shadow-white/30 p-6"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold text-white">
								최근 시청 이력
							</h2>
							<Link
								href="/my/history"
								className="text-[#DDE66E] hover:text-[#b8e600] text-sm font-medium"
							>
								전체보기
							</Link>
						</div>
						<div className="space-y-4">
							{watchHistory.length > 0 ? (
								watchHistory.map((item) => (
									<div
										key={item.id}
										className="flex items-center space-x-4 p-3 hover:bg-neutral-800 rounded-lg transition-colors"
									>
										<Image
											src={item.poster}
											alt={item.title}
											width={48}
											height={72}
											className="w-12 h-18 object-cover rounded"
										/>
										<div className="flex-1">
											<h3 className="font-medium text-white">{item.title}</h3>
											<p className="text-sm text-gray-400">{item.watchDate}</p>
											{item.rating && (
												<div className="flex items-center mt-1">
													{[...Array(5)].map((_, i) => (
														<svg
															key={i}
															className={`w-4 h-4 ${
																i < item.rating!
																	? "text-yellow-400"
																	: "text-gray-300"
															}`}
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
														</svg>
													))}
												</div>
											)}
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8">
									<svg
										className="w-12 h-12 text-gray-400 mx-auto mb-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
									<p className="text-sm text-gray-400">
										아직 시청한 영화가 없습니다.
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Favorites */}
					<div
						className="bg-neutral-900 rounded-lg
            inset-shadow-xs inset-shadow-white/30
            shadow-xs shadow-white/30 p-6"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold text-white">즐겨찾기</h2>
							<Link
								href="/my/favorites"
								className="text-[#DDE66E] hover:text-[#b8e600] text-sm font-medium"
							>
								전체보기
							</Link>
						</div>
						<div className="space-y-4">
							{recentFavorites.length > 0 ? (
								recentFavorites.map((movie) => (
									<div
										key={movie.id}
										className="flex items-center space-x-4 p-3 hover:bg-neutral-800 rounded-lg transition-colors"
									>
										<Image
											src={movie.imgUrl}
											alt={movie.title}
											width={48}
											height={72}
											className="w-12 h-18 object-cover rounded"
										/>
										<div className="flex-1">
											<h3 className="font-medium text-white">{movie.title}</h3>
											<p className="text-sm text-gray-400">
												{movie.release instanceof Date
													? movie.release.getFullYear()
													: new Date(movie.release).getFullYear()}{" "}
												• {movie.genre}
											</p>
										</div>
										<button
											className="text-red-500 hover:text-red-600 transition-colors"
											onClick={() => removeFromFavorites(movie.id)}
										>
											<svg
												className="w-5 h-5"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</div>
								))
							) : (
								<div className="text-center py-8">
									<svg
										className="w-12 h-12 text-gray-400 mx-auto mb-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
										/>
									</svg>
									<p className="text-sm text-gray-400">
										아직 즐겨찾기에 추가한 영화가 없습니다.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
				</div>
			</MyLayout>

			{/* 로그인 모달 */}
			<SignInModal
				isOpen={showSignInModal}
				onClose={() => setShowSignInModal(false)}
				onSwitchToSignUp={() => {
					setShowSignInModal(false);
					setShowSignUpModal(true);
				}}
			/>

			{/* 회원가입 모달 */}
			<SignUpModal
				isOpen={showSignUpModal}
				onClose={() => setShowSignUpModal(false)}
				onSwitchToSignIn={() => {
					setShowSignUpModal(false);
					setShowSignInModal(true);
				}}
			/>
		</>
	);
}
