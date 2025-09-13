import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthUser extends User {
  nickname?: string
  profile_image?: string
  bio?: string
  points?: number
  selectedOttPlatforms?: string[]
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!error) {
          setSession(session)
          if (session?.user) {
            await fetchUserProfile(session.user)
          }
        }
      } catch {
        // 세션 조회 실패시 무시
      }
      setLoading(false)
    }

    getSession()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (authUser: User) => {
    try {
      // localStorage에서 백업 데이터 확인
      let selectedOttPlatforms = authUser.user_metadata?.selectedOttPlatforms || []
      let nickname = authUser.user_metadata?.nickname || authUser.email?.split('@')[0] || 'User'
      let bio = authUser.user_metadata?.bio || ''
      
      if (typeof window !== 'undefined') {
        try {
          // OTT 플랫폼 데이터
          const localOttData = localStorage.getItem(`ott_platforms_${authUser.id}`)
          if (localOttData) {
            const localPlatforms = JSON.parse(localOttData)
            selectedOttPlatforms = localPlatforms
          }

          // 프로필 데이터
          const localProfileData = localStorage.getItem(`profile_${authUser.id}`)
          if (localProfileData) {
            const localProfile = JSON.parse(localProfileData)
            nickname = localProfile.nickname || nickname
            bio = localProfile.bio || bio
          }
        } catch (localError) {
          console.warn('localStorage에서 데이터 읽기 실패:', localError)
        }
      }

      // 사용자 정보 구성
      const userData: AuthUser = {
        ...authUser,
        nickname: nickname,
        profile_image: authUser.user_metadata?.profile_image,
        bio: bio,
        points: 100, // 기본 포인트
        selectedOttPlatforms: selectedOttPlatforms
      }

      setUser(userData)
    } catch {
      // 프로필 조회 실패시 localStorage에서라도 데이터 복구 시도
      let fallbackOttPlatforms = []
      let fallbackNickname = authUser.email?.split('@')[0] || 'User'
      let fallbackBio = ''
      
      if (typeof window !== 'undefined') {
        try {
          const localOttData = localStorage.getItem(`ott_platforms_${authUser.id}`)
          if (localOttData) {
            fallbackOttPlatforms = JSON.parse(localOttData)
          }

          const localProfileData = localStorage.getItem(`profile_${authUser.id}`)
          if (localProfileData) {
            const localProfile = JSON.parse(localProfileData)
            fallbackNickname = localProfile.nickname || fallbackNickname
            fallbackBio = localProfile.bio || fallbackBio
          }
        } catch (localError) {
          console.warn('localStorage fallback 실패:', localError)
        }
      }
      
      setUser({
        ...authUser,
        nickname: fallbackNickname,
        bio: fallbackBio,
        points: 100,
        selectedOttPlatforms: fallbackOttPlatforms
      } as AuthUser)
    }
  }

  const signUp = async (email: string, password: string, nickname: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname,
            selectedOttPlatforms: [] // 기본값 설정
          }
        }
      })

      if (error) {
        throw new Error(`회원가입 실패: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('회원가입 오류:', error)
      throw error instanceof Error ? error : new Error('회원가입 중 알 수 없는 오류가 발생했습니다.')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw new Error(`로그인 실패: ${error.message}`)
      }
      
      // 로그인 성공 시 즉시 사용자 프로필 가져오기
      if (data.user) {
        await fetchUserProfile(data.user)
      }
      
      return data
    } catch (error) {
      console.error('로그인 오류:', error)
      throw error instanceof Error ? error : new Error('로그인 중 알 수 없는 오류가 발생했습니다.')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(`로그아웃 실패: ${error.message}`)
      }
    } catch (error) {
      console.error('로그아웃 오류:', error)
      throw error instanceof Error ? error : new Error('로그아웃 중 알 수 없는 오류가 발생했습니다.')
    }
  }

  const updateOttPlatforms = async (platforms: string[]) => {
    if (!user) {
      throw new Error('사용자가 로그인되어 있지 않습니다.')
    }

    try {
      // 먼저 로컬 상태와 localStorage에 저장 (즉시 반영)
      const updatedUser = {
        ...user,
        selectedOttPlatforms: platforms,
        user_metadata: {
          ...user.user_metadata,
          selectedOttPlatforms: platforms
        }
      }
      
      setUser(updatedUser)
      
      // localStorage에도 백업 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ott_platforms_${user.id}`, JSON.stringify(platforms))
      }

      // Supabase 업데이트 시도 (실패해도 로컬 저장은 유지)
      try {
        const updatedData = {
          ...user.user_metadata,
          selectedOttPlatforms: platforms
        }

        const { error } = await supabase.auth.updateUser({
          data: updatedData
        })

        if (error) {
          console.warn('Supabase 동기화 실패 (로컬 저장은 유지됨):', error)
          // 에러를 throw하지 않고 경고만 표시
        }
      } catch (syncError) {
        console.warn('Supabase 동기화 실패 (로컬 저장은 유지됨):', syncError)
        // 동기화 실패해도 로컬 저장은 성공으로 처리
      }

    } catch (error) {
      console.error('OTT 플랫폼 업데이트 실패:', error)
      throw error instanceof Error ? error : new Error('OTT 플랫폼 업데이트 중 알 수 없는 오류가 발생했습니다.')
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateOttPlatforms
  }
}