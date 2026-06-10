import { CreatorLayout } from '@/components/layout/CreatorLayout'

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CreatorLayout>{children}</CreatorLayout>
}
