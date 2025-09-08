import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthUser extends User {
  nickname?: string
  profile_image?: string
  points?: number
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Supabase 연결 상태 확인
    console.log('🔧 Supabase client initialized:', !!supabase)
    console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔧 Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    // 현재 세션 확인
    const getSession = async () => {
      try {
        console.log('📡 Getting session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error.message, error)
        } else {
          console.log('✅ Session retrieved:', session ? 'User logged in' : 'No session')
          setSession(session)
          if (session?.user) {
            console.log('👤 User found in session:', session.user.email)
            await fetchUserProfile(session.user)
          }
        }
      } catch (err) {
        console.error('❌ Exception in getSession:', err)
      }
      setLoading(false)
    }

    getSession()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session ? 'with session' : 'no session')
        setSession(session)
        
        if (session?.user) {
          console.log('👤 User in state change:', session.user.email)
          await fetchUserProfile(session.user)
        } else {
          console.log('👤 No user in state change, clearing user state')
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      console.log('🧹 Cleaning up auth subscription')
      subscription?.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (authUser: User) => {
    try {
      // 사용자 프로필 정보 조회
      const { data: profile, error } = await supabase
        .from('users')
        .select('nickname, profile_image, points')
        .eq('id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
      }

      const userData: AuthUser = {
        ...authUser,
        nickname: profile?.nickname || authUser.email?.split('@')[0] || 'User',
        profile_image: profile?.profile_image,
        points: profile?.points || 0
      }

      setUser(userData)
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      setUser(authUser as AuthUser)
    }
  }

  const signUp = async (email: string, password: string, nickname: string) => {
    console.log('🚀 Starting signup process for:', email)
    
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
        console.error('❌ Signup error:', error.message, error)
        throw error
      }

      console.log('✅ Signup successful:', data)
      console.log('📧 User needs email confirmation:', !data.session && data.user)

      // 사용자 프로필 생성 (optional - 테이블이 있을 경우)
      if (data.user) {
        try {
          console.log('💾 Creating user profile...')
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              nickname: nickname,
              points: 100 // 신규 가입 보너스 포인트
            })

          if (profileError) {
            console.log('⚠️ Profile creation failed (table may not exist):', profileError.message)
          } else {
            console.log('✅ User profile created successfully')
          }
        } catch (profileError) {
          console.log('⚠️ Profile creation exception:', profileError)
        }
      }

      return data
    } catch (err) {
      console.error('❌ Exception in signUp:', err)
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
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