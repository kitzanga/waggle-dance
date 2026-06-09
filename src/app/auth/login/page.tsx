'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
      setError(null)
      // Show confirmation message
      setError('Check your email for a confirmation link.')
      setLoading(false)
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
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-[var(--color-text-primary)] mb-2 text-center">
          Waggle Dance
        </h1>
        <p className="text-[var(--color-text-secondary)] text-center mb-8">
          {isSignUp ? 'Create your account' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />

          {error && (
            <p
              className="text-sm text-[var(--color-error)] text-center"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full mt-2">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
          }}
          className="w-full mt-4 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors text-center"
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
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
