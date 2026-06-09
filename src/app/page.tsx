import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-text-primary)] mb-4 leading-tight">
          Waggle Dance
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
          Turn complexity into signal. Create stories that move people before
          their defenses are up.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/login">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
