'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IntakeChat } from '@/components/intake/IntakeChat'
import { GenerationTransition } from '@/components/story/GenerationTransition'
import { StyleSelector } from '@/components/story/StyleSelector'
import { Button } from '@/components/ui/Button'
import { useStoryGeneration } from '@/hooks/useStoryGeneration'
import type { IntakeSignals, VisualStyle } from '@/types/story'

type FlowPhase = 'intake' | 'style' | 'generating' | 'complete'

export default function NewStoryPage() {
  const [storyId, setStoryId] = useState<string | null>(null)
  const [phase, setPhase] = useState<FlowPhase>('intake')
  const [signals, setSignals] = useState<IntakeSignals | null>(null)
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('watercolor')
  const router = useRouter()

  // Create story record on mount
  useEffect(() => {
    async function createStory() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('stories')
        .insert({ user_id: user.id, topic: '' })
        .select('id')
        .single()

      if (!error && data) {
        setStoryId(data.id)
      }
    }
    createStory()
  }, [router])

  const { phase: genPhase, transitionMessage, generate, error: genError } =
    useStoryGeneration({ storyId: storyId || '' })

  function handleIntakeComplete(completedSignals: IntakeSignals) {
    setSignals(completedSignals)
    setPhase('style')
  }

  async function handleGenerate() {
    if (!signals || !storyId) return
    setPhase('generating')

    const supabase = createClient()
    await supabase
      .from('stories')
      .update({ topic: signals.topic })
      .eq('id', storyId)

    await generate(signals, visualStyle)
    router.push(`/stories/${storyId}`)
  }

  if (!storyId) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: 'calc(100vh - 48px)' }}
        role="status"
        aria-label="Loading"
      >
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          aria-hidden="true"
        />
      </div>
    )
  }

  // Intake phase
  if (phase === 'intake') {
    return <IntakeChat storyId={storyId} onComplete={handleIntakeComplete} />
  }

  // Style selection phase
  if (phase === 'style') {
    return (
      <div
        className="flex flex-col items-center justify-center px-4"
        style={{ minHeight: 'calc(100vh - 48px)' }}
      >
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <h2
              className="mb-2"
              style={{
                fontFamily: 'var(--font-reading)',
                fontSize: 'var(--text-xl)',
                color: 'var(--text-primary)',
                fontWeight: 400,
              }}
            >
              One last thing
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Choose how the illustrations will feel. You can change this later.
            </p>
          </div>

          <StyleSelector currentStyle={visualStyle} onChange={setVisualStyle} />

          <Button onClick={handleGenerate} className="w-full" size="lg">
            Find the story
          </Button>
        </div>
      </div>
    )
  }

  // Generation phase
  if (phase === 'generating') {
    return (
      <GenerationTransition
        isActive={genPhase === 'transition' || genPhase === 'streaming' || genPhase === 'idle'}
        message={transitionMessage}
      />
    )
  }

  return null
}
