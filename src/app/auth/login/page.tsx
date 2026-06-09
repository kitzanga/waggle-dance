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
      // Sign in immediately after signup (since email confirmation is disabled)
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
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-[320px]">
        <h1 className="text-[24px] font-semibold text-[var(--color-text-primary)] mb-1 text-center tracking-tight">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="text-[13px] text-[var(--color-text-tertiary)] text-center mb-8">
          {isSignUp ? 'Get started with Waggle Dance' : 'Welcome back'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="email" className="text-[13px] text-[var(--color-text-secondary)] mb-1.5 block">
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
              className="
                w-full rounded-[var(--radius-md)] px-3.5 py-2.5
                bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
                placeholder:text-[var(--color-text-tertiary)]
                focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/30
                text-[15px] min-h-[44px]
              "
            />
          </div>

          <div>
            <label htmlFor="password" className="text-[13px] text-[var(--color-text-secondary)] mb-1.5 block">
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
              className="
                w-full rounded-[var(--radius-md)] px-3.5 py-2.5
                bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
                placeholder:text-[var(--color-text-tertiary)]
                focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/30
                text-[15px] min-h-[44px]
              "
            />
          </div>

          {error && (
            <p className="text-[13px] text-[var(--color-error)] text-center" role="alert">
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
          className="w-full mt-5 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors text-center"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
