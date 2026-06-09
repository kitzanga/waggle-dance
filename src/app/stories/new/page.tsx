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
      if (!user) return

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
  }, [])

  const { phase: genPhase, transitionMessage, generate, error: genError } =
    useStoryGeneration({ storyId: storyId || '' })

  function handleIntakeComplete(completedSignals: IntakeSignals) {
    setSignals(completedSignals)
    setPhase('style')
  }

  async function handleGenerate() {
    if (!signals || !storyId) return
    setPhase('generating')

    // Update topic in the DB before generating
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
      <div className="flex items-center justify-center min-h-screen">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    )
  }

  // Intake phase
  if (phase === 'intake') {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
          <h1 className="font-serif text-lg text-[var(--color-text-primary)]">New Story</h1>
        </header>
        <div className="flex-1">
          <IntakeChat storyId={storyId} onComplete={handleIntakeComplete} />
        </div>
      </div>
    )
  }

  // Style selection phase
  if (phase === 'style') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-2xl text-[var(--color-text-primary)] mb-2">
              One last thing
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Choose how the illustrations will feel. You can change this later.
            </p>
          </div>

          <StyleSelector
            currentStyle={visualStyle}
            onChange={setVisualStyle}
          />

          <Button onClick={handleGenerate} className="w-full" size="lg">
            Create the Story
          </Button>
        </div>
      </div>
    )
  }

  // Generation phase
  if (phase === 'generating') {
    return (
      <div className="min-h-screen">
        <GenerationTransition
          isActive={genPhase === 'transition' || genPhase === 'streaming' || genPhase === 'idle'}
          message={transitionMessage}
        />
        {genError && (
          <div className="text-center px-4">
            <p className="text-[var(--color-error)] mb-4">{genError}</p>
            <Button onClick={handleGenerate}>Try Again</Button>
          </div>
        )}
      </div>
    )
  }

  return null
}
