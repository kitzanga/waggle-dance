import Link from 'next/link'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h2
        className="mb-3"
        style={{ fontFamily: 'var(--font-reading)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}
      >
        No stories yet
      </h2>
      <p className="mb-8 max-w-sm" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>
        Create your first story. Start with the idea you need to communicate,
        and the engine will find the narrative that makes people feel it.
      </p>
      <Link
        href="/stories/new"
        className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 min-h-[44px]"
        style={{
          background: 'var(--accent)',
          color: '#ffffff',
          padding: '10px 24px',
          fontSize: 'var(--text-base)',
        }}
      >
        Create Your First Story
      </Link>
    </div>
  )
}
