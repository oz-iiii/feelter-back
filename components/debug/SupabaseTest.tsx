"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setTestResult('Testing connection...')

    try {
      // 1. 기본 연결 테스트
      console.log('🔧 Testing basic connection...')
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setTestResult(`❌ Connection failed: ${error.message}`)
        return
      }

      // 2. 간단한 쿼리 테스트 (movies 테이블 존재 확인)
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('id')
        .limit(1)

      let dbTest = ''
      if (moviesError) {
        dbTest = `⚠️ Database query failed: ${moviesError.message}`
      } else {
        dbTest = `✅ Database connected (${moviesData?.length || 0} movies found)`
      }

      setTestResult(`✅ Auth connection successful
${dbTest}
🔧 Current session: ${data.session ? 'Logged in' : 'No session'}`)

    } catch (err: any) {
      console.error('Test failed:', err)
      setTestResult(`❌ Test failed: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testEmailDelivery = async () => {
    setIsLoading(true)
    setTestResult('이메일 인증 테스트는 실제 회원가입을 통해 확인해주세요.\n\n아래 "회원가입" 버튼을 사용하여 실제 이메일로 가입하시면\n인증 메일이 발송됩니다.')
    setIsLoading(false)
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 mb-4">
      <h3 className="text-white font-bold mb-4">🔧 Supabase Debug Panel</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          Test Connection
        </button>
        
        <button
          onClick={testEmailDelivery}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          Email 인증 안내
        </button>
      </div>

      {testResult && (
        <pre className="bg-black text-green-400 p-3 rounded text-sm overflow-auto whitespace-pre-wrap">
          {testResult}
        </pre>
      )}
      
      <div className="mt-2 text-xs text-gray-400">
        <p>🔧 URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>🔑 Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}</p>
      </div>
    </div>
  )
}