import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/navbar'
import RevenueList from '@/components/revenue/revenue-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function RevenuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  const canEdit = profile.role === 'owner' || profile.role === 'staff'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">収益管理</h1>
            <Link href="/revenue/new">
              <Button>新規登録</Button>
            </Link>
          </div>
          <RevenueList farmId={profile.id} canEdit={canEdit} />
        </div>
      </div>
    </div>
  )
}


