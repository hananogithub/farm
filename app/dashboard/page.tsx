import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Try to get user - if it fails, redirect to login
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user) {
    console.log('Dashboard - No user found, redirecting to login')
    redirect('/auth/login')
  }

  console.log('Dashboard - User found:', user.id)

  // Get user profile - use maybeSingle() to handle case when profile doesn't exist
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // If profile doesn't exist, create it automatically
  if (!profile) {
    console.log('Dashboard - No profile found for user:', user.id, 'Creating profile...')
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        role: 'owner',
        farm_name: 'マイ農場',
      })
      .select()
      .single()

    if (createError) {
      console.error('Dashboard - Failed to create profile:', createError.message)
      // If creation fails, redirect to seed page where user can create profile manually
      redirect('/admin/seed')
    }

    profile = newProfile
    console.log('Dashboard - Profile created:', profile.id, 'Farm name:', profile.farm_name)
  } else {
    console.log('Dashboard - Profile found:', profile.id, 'Farm name:', profile.farm_name)
  }

  // Get current month profit
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Get monthly profit (all farms if no profile)
  const { data: monthlyProfit } = profile
    ? await supabase
        .from('monthly_profit')
        .select('*')
        .eq('farm_id', profile.id)
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .single()
    : { data: null }

  // Get last month for comparison
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const { data: lastMonthProfit } = profile
    ? await supabase
        .from('monthly_profit')
        .select('*')
        .eq('farm_id', profile.id)
        .eq('year', lastMonthYear)
        .eq('month', lastMonth)
        .single()
    : { data: null }

  // Get recent revenue (all if no profile)
  const { data: recentRevenue } = profile
    ? await supabase
        .from('revenue')
        .select('*')
        .eq('farm_id', profile.id)
        .order('transaction_date', { ascending: false })
        .limit(5)
    : await supabase
        .from('revenue')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(5)

  // Get recent expenses (all if no profile)
  const { data: recentExpenses } = profile
    ? await supabase
        .from('expenses')
        .select('*')
        .eq('farm_id', profile.id)
        .order('transaction_date', { ascending: false })
        .limit(5)
    : await supabase
        .from('expenses')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(5)

  // Get upcoming subsidies (all if no profile)
  const { data: upcomingSubsidies } = profile
    ? await supabase
        .from('subsidies')
        .select('*')
        .eq('farm_id', profile.id)
        .in('status', ['applied', 'approved'])
        .gte('application_deadline', new Date().toISOString().split('T')[0])
        .order('application_deadline', { ascending: true })
        .limit(5)
    : await supabase
        .from('subsidies')
        .select('*')
        .in('status', ['applied', 'approved'])
        .gte('application_deadline', new Date().toISOString().split('T')[0])
        .order('application_deadline', { ascending: true })
        .limit(5)

  const currentProfit = monthlyProfit?.profit || 0
  const previousProfit = lastMonthProfit?.profit || 0
  const profitChange = currentProfit - previousProfit
  const profitChangePercent = previousProfit !== 0 
    ? ((profitChange / previousProfit) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.farm_name || 'ダッシュボード'}
            </h1>
            <Link href="/profile">
              <Button variant="outline">プロフィール編集</Button>
            </Link>
          </div>

          {/* Profit Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">今月の利益</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(currentProfit)}
                </div>
                <div className={`text-sm mt-2 ${
                  profitChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {profitChange >= 0 ? '+' : ''}{formatCurrency(profitChange)} 
                  ({profitChangePercent}%)
                </div>
                <div className="text-xs text-gray-900 mt-1">
                  前月比
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">今月の収益</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(monthlyProfit?.total_revenue || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">今月の支出</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(monthlyProfit?.total_expenses || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">最近の収益</CardTitle>
              </CardHeader>
              <CardContent>
                {recentRevenue && recentRevenue.length > 0 ? (
                  <div className="space-y-4">
                    {recentRevenue.map((revenue) => (
                      <div key={revenue.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <div className="font-medium text-gray-900">{revenue.revenue_type}</div>
                          <div className="text-sm text-gray-900">
                            {formatDate(revenue.transaction_date)}
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(revenue.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-900">収益データがありません</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">最近の支出</CardTitle>
              </CardHeader>
              <CardContent>
                {recentExpenses && recentExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {recentExpenses.map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <div className="font-medium text-gray-900">{expense.category}</div>
                          <div className="text-sm text-gray-900">
                            {formatDate(expense.transaction_date)}
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-red-600">
                          {formatCurrency(expense.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-900">支出データがありません</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Subsidies */}
          {upcomingSubsidies && upcomingSubsidies.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-gray-900">期限が近い補助金・助成金</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSubsidies.map((subsidy) => (
                    <div key={subsidy.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-medium text-gray-900">{subsidy.name}</div>
                        <div className="text-sm text-gray-900">
                          期限: {subsidy.application_deadline ? formatDate(subsidy.application_deadline) : '未設定'}
                        </div>
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(subsidy.expected_amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


