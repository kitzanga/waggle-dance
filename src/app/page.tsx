import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-[48px] font-semibold text-[var(--color-text-primary)] mb-4 tracking-tight leading-[1.1]">
          Waggle Dance
        </h1>
        <p className="text-[17px] text-[var(--color-text-secondary)] mb-10 leading-relaxed">
          Turn complexity into signal. Create stories that move people before
          their defenses are up.
        </p>
        <Link href="/auth/login">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </main>
  )
}
