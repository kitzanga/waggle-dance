import { TopNav } from '@/components/ui/TopNav'

interface CreatorLayoutProps {
  children: React.ReactNode
}

export function CreatorLayout({ children }: CreatorLayoutProps) {
  return (
    <div
      data-mode="light"
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--surface-page)',
        color: 'var(--text-primary)',
      }}
    >
      <TopNav />
      <main id="main-content">{children}</main>
    </div>
  )
}
