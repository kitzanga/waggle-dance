'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Library',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: '/stories/new',
    label: 'New Story',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[var(--sidebar-width)] bg-[var(--color-bg-secondary)] border-r border-[var(--color-separator)] flex flex-col z-40 hidden md:flex">
      {/* Logo area */}
      <div className="h-14 flex items-center px-5">
        <span className="text-[13px] font-semibold text-[var(--color-text-secondary)] tracking-wide">
          Waggle Dance
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/dashboard' && pathname.startsWith('/stories/') && pathname !== '/stories/new')

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-[7px] rounded-[var(--radius-sm)] text-[13px] font-medium
                    transition-colors duration-150
                    ${
                      isActive
                        ? 'bg-[rgba(255,159,10,0.12)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-[var(--color-separator)]">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-[7px] rounded-[var(--radius-sm)] text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors w-full"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
