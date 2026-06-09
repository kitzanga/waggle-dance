import { Sidebar } from '@/components/ui/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-[var(--sidebar-width)] min-h-screen">
        {children}
      </main>
    </div>
  )
}
