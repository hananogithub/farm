'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setError(null)
    setLoading(true)

    try {
      console.log('Starting login...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log('Login successful, user:', data.user?.id)
      console.log('Session:', data.session ? 'exists' : 'missing')

      if (data.user && data.session) {
        console.log('✅ Login successful - User ID:', data.user.id)
        console.log('✅ Session exists:', !!data.session)
        
        // createBrowserClient automatically sets cookies in the browser
        // Wait for cookies to be properly set
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Verify session is accessible on client side
        const { data: { session: verifiedSession }, error: sessionError } = await supabase.auth.getSession()
        console.log('✅ Session verification - exists:', !!verifiedSession, 'error:', sessionError)
        
        // Check if cookies are set
        const cookies = document.cookie
        console.log('✅ Cookies:', cookies ? 'set' : 'not set')
        if (cookies) {
          const cookieNames = cookies.split(';').map(c => c.split('=')[0].trim()).join(', ')
          console.log('✅ Cookie names:', cookieNames)
          
          // Check for Supabase auth cookies
          const hasAuthCookies = cookieNames.includes('sb-') || cookieNames.includes('supabase')
          console.log('✅ Has auth cookies:', hasAuthCookies)
        }
        
        // Redirect to dashboard using Next.js router
        // router.push() is the correct way for Client Components
        console.log('✅ Redirecting to dashboard...')
        router.push('/dashboard')
      } else {
        console.error('❌ No user or session after login')
        setError('ログインに失敗しました。セッションが作成されませんでした。')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('ログイン中にエラーが発生しました。')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            DairyFarm Insight
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントにログイン
          </p>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleLogin}
          method="post"
          action="#"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              新規登録はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}


