import Link from 'next/link'

export default function Home() {
  return (
    <div
      data-mode="light"
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--surface-page)', color: 'var(--text-primary)' }}
    >
      <main id="main-content" className="max-w-lg text-center">
        <h1
          className="mb-4 tracking-tight leading-[1.1]"
          style={{ fontSize: '48px', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          Waggle Dance
        </h1>
        <p
          className="mb-10 leading-relaxed"
          style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}
        >
          Turn complexity into signal. Create stories that move people before
          their defenses are up.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 min-h-[44px]"
          style={{
            background: 'var(--accent)',
            color: '#ffffff',
            padding: '10px 24px',
            fontSize: 'var(--text-base)',
          }}
        >
          Get Started
        </Link>
      </main>
    </div>
  )
}
