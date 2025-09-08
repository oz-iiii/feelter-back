import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthUser extends User {
  nickname?: string
  profile_image?: string
  bio?: string
  points?: number
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
      } catch (err) {
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
      // Supabase auth 메타데이터에서 사용자 정보 가져오기
      const userData: AuthUser = {
        ...authUser,
        nickname: authUser.user_metadata?.nickname || authUser.email?.split('@')[0] || 'User',
        profile_image: authUser.user_metadata?.profile_image,
        bio: authUser.user_metadata?.bio,
        points: 100 // 기본 포인트
      }

      setUser(userData)
    } catch (error) {
      // 프로필 조회 실패시 기본 사용자 정보 사용
      setUser(authUser as AuthUser)
    }
  }

  const signUp = async (email: string, password: string, nickname: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname
          }
        }
      })

      if (error) {
        throw error
      }

      // 사용자 프로필은 auth 메타데이터에 저장
      // users 테이블이 없으므로 별도 프로필 테이블 생성 생략

      return data
    } catch (err) {
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }
    
    // 로그인 성공 시 즉시 사용자 프로필 가져오기
    if (data.user) {
      await fetchUserProfile(data.user)
    }
    
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  }
}