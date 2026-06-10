import { CreatorLayout } from '@/components/layout/CreatorLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CreatorLayout>{children}</CreatorLayout>
}
