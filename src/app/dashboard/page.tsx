import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, topic, status, share_active, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return <DashboardClient stories={stories || []} />
}
