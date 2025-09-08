"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import MyLayout from "@/components/my/MyLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import SignInModal from "@/components/auth/SignInModal";
import SignUpModal from "@/components/auth/SignUpModal";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempProfile, setTempProfile] = useState<any>(null);
  
  // 모달 상태 관리
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  useEffect(() => {
    if (user) {
      setTempProfile({
        nickname: user.nickname || user.email?.split('@')[0] || '',
        email: user.email || '',
        profileImage: user.profile_image || '',
        bio: user.bio || '',
        points: user.points || 0
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!tempProfile) return;
    
    setIsSaving(true);
    try {
      // Supabase auth 사용자 메타데이터 업데이트
      const { data, error } = await supabase.auth.updateUser({
        data: {
          nickname: tempProfile.nickname,
          profile_image: tempProfile.profileImage,
          bio: tempProfile.bio
        }
      });
      
      if (error) {
        throw error;
      }
      
      // 성공적으로 저장됨
      alert('프로필이 성공적으로 저장되었습니다!');
      setIsEditing(false);
      
      // 페이지 새로고침으로 업데이트된 정보 반영
      window.location.reload();
      
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      alert('프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setTempProfile({
        nickname: user.nickname || user.email?.split('@')[0] || '',
        email: user.email || '',
        profileImage: user.profile_image || '',
        bio: user.bio || '',
        points: user.points || 0
      });
    }
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && tempProfile) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempProfile({
          ...tempProfile,
          profileImage: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 로딩 중이거나 비회원 상태일 때 처리
  if (loading) {
    return (
      <MyLayout>
        <div className="w-full max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-neutral-900 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8e600] mx-auto"></div>
            <p className="text-gray-400 mt-4">로딩 중...</p>
          </div>
        </div>
      </MyLayout>
    );
  }

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
              프로필을 편집하려면 로그인해주세요.
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">프로필 편집</h1>
          </div>

          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#DDE66E] hover:bg-[#b8e600] disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg transition-colors flex items-center"
                >
                  {isSaving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  )}
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-[#DDE66E] hover:bg-[#b8e600] text-black rounded-lg transition-colors"
              >
                편집하기
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div
              className="bg-neutral-900 rounded-lg
            inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                프로필 이미지
              </h2>
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-gray-200 mb-4 flex items-center justify-center">
                    {(isEditing && tempProfile?.profileImage) || user?.profile_image ? (
                      <Image
                        src={
                          isEditing && tempProfile
                            ? tempProfile.profileImage
                            : user?.profile_image || ""
                        }
                        alt="프로필 이미지"
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-[#DDE66E] hover:bg-[#b8e600] text-black p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  가입일: {user?.email ? "인증 완료" : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="lg:col-span-2">
            <div
              className="bg-neutral-900 rounded-lg
            inset-shadow-xs inset-shadow-white/30 shadow-xs shadow-white/30 p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-6">
                기본 정보
              </h2>

              <div className="space-y-6">
                {/* Nickname */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    닉네임
                  </label>
                  {isEditing && tempProfile ? (
                    <input
                      type="text"
                      value={tempProfile.nickname}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          nickname: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                    />
                  ) : (
                    <p className="text-white py-2">{user?.nickname || user?.email?.split('@')[0] || "-"}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    이메일
                  </label>
                  {isEditing && tempProfile ? (
                    <input
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                    />
                  ) : (
                    <p className="text-white py-2">{user?.email || "-"}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    자기소개
                  </label>
                  {isEditing && tempProfile ? (
                    <textarea
                      value={tempProfile.bio || ''}
                      onChange={(e) =>
                        setTempProfile({ ...tempProfile, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                    />
                  ) : (
                    <p className="text-white py-2">{user?.bio || "자기소개가 없습니다."}</p>
                  )}
                </div>

                {/* Favorite Genres */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    선호 장르
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 border border-gray-600 text-gray-400 text-sm rounded-full">
                      선호 장르 설정은 추후 업데이트 예정입니다
                    </span>
                  </div>
                </div>

                {/* Favorite Directors */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    선호 감독
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 border border-gray-600 text-gray-400 text-sm rounded-full">
                      선호 감독 설정은 추후 업데이트 예정입니다
                    </span>
                  </div>
                </div>
              </div>
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
