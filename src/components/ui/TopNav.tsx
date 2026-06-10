'use client'

import Link from 'next/link'

export function TopNav() {
  return (
    <header
      className="h-12 w-full flex items-center justify-between border-b px-6 md:px-10"
      style={{
        background: 'var(--surface-bar, transparent)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Left: Wordmark */}
      <Link
        href="/dashboard"
        className="text-[14px] font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        Waggle Dance
      </Link>

      {/* Right: Navigation controls */}
      <nav className="flex items-center gap-2" aria-label="Main navigation">
        <Link
          href="/dashboard"
          className="text-[13px] transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
        >
          Library
        </Link>
        <Link
          href="/stories/new"
          className="text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{
            color: 'var(--accent)',
            background: 'var(--accent-bg)',
            border: '0.5px solid var(--accent-border)',
            borderRadius: '20px',
            padding: '4px 12px',
          }}
        >
          + New
        </Link>
      </nav>
    </header>
  )
}
