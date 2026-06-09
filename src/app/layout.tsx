import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Waggle Dance',
  description:
    'Turn complexity into signal. Communicate ideas people can feel, orient around, and carry forward.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] antialiased">
        {children}
      </body>
    </html>
  )
}
