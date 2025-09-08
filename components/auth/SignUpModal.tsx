"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignIn: () => void
}

export default function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await signUp(email, password, nickname)
      
      setSuccess(true)
      // 회원가입 성공 후 3초 뒤 모달 닫기 (이메일 확인 시간 고려)
      setTimeout(() => {
        setSuccess(false)
        resetForm()
        onClose()
      }, 3000)
    } catch (err: any) {
      
      // 구체적인 에러 메시지 처리
      let errorMessage = '회원가입 중 오류가 발생했습니다.'
      
      if (err.message.includes('User already registered')) {
        errorMessage = '이미 등록된 이메일입니다.'
      } else if (err.message.includes('Invalid email') || err.message.includes('email_address_invalid')) {
        errorMessage = '올바른 이메일 주소를 입력해주세요. (예: user@gmail.com)'
      } else if (err.message.includes('Password should be at least 6 characters')) {
        errorMessage = '비밀번호는 6자 이상이어야 합니다.'
      } else if (err.code === 'email_address_invalid') {
        errorMessage = '사용할 수 없는 이메일 도메인입니다. Gmail, Naver 등을 사용해주세요.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setNickname('')
    setError('')
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">회원가입 완료!</h3>
            <p className="text-gray-400 mb-4">
              <strong>{email}</strong>로 인증 이메일을 발송했습니다.<br />
              <span className="text-yellow-400">📧 이메일을 확인하여 인증을 완료해주세요.</span>
            </p>
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mb-4">
              <p className="text-yellow-300 text-sm">
                <strong>중요:</strong> 스팸/정크 메일함도 확인해주세요.<br />
                인증 완료 후 로그인이 가능합니다.
              </p>
            </div>
            <p className="text-sm text-gray-500">잠시 후 창이 자동으로 닫힙니다...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">회원가입</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent"
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-[#DDE66E] hover:bg-[#b8e600] text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={onSwitchToSignIn}
              className="text-[#DDE66E] hover:text-[#b8e600] transition-colors"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}