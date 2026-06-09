import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h2 className="font-serif text-2xl text-[var(--color-text-primary)] mb-3">
        No stories yet
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm">
        Create your first story. Start with the idea you need to communicate,
        and the engine will find the narrative that makes people feel it.
      </p>
      <Link href="/stories/new">
        <Button size="lg">Create Your First Story</Button>
      </Link>
    </div>
  )
}
