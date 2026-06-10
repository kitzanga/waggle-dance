'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        setError('Account created. Please sign in.')
        setIsSignUp(false)
        setLoading(false)
        return
      }
      router.push(redirectTo)
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div
      data-mode="light"
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--surface-page)', color: 'var(--text-primary)' }}
    >
      <main id="main-content" className="w-full max-w-[320px]">
        <h1
          className="mb-1 text-center tracking-tight"
          style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        <p
          className="text-center mb-8"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}
        >
          {isSignUp ? 'Get started with Waggle Dance' : 'Welcome back'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block"
              style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full px-3.5 py-2.5 min-h-[44px]"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-input)',
                color: 'var(--text-primary)',
                border: '0.5px solid var(--border-input)',
                fontSize: 'var(--text-base)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block"
              style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full px-3.5 py-2.5 min-h-[44px]"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-input)',
                color: 'var(--text-primary)',
                border: '0.5px solid var(--border-input)',
                fontSize: 'var(--text-base)',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p className="text-center" style={{ fontSize: 'var(--text-sm)', color: '#ff453a' }} role="alert">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
          }}
          className="w-full mt-5 transition-colors text-center min-h-[44px]"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
