'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/layout/navbar'

export default function SeedDataPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const createSeedData = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('エラー: ログインが必要です')
        setLoading(false)
        return
      }

      // Get or create profile
      let { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      // Check if table exists
      if (profileFetchError && profileFetchError.message.includes('schema cache')) {
        setMessage('エラー: データベースのマイグレーションが実行されていません。\n\nSupabaseダッシュボードのSQL Editorで、以下のファイルを順番に実行してください：\n1. supabase/migrations/001_initial_schema.sql\n2. supabase/migrations/003_add_profile_insert_policy.sql')
        setLoading(false)
        return
      }

      // If profile doesn't exist, try to create it
      if (!profile) {
        // Try to insert profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            role: 'owner',
            farm_name: 'テスト農場',
          })
          .select()
          .single()

        if (profileError) {
          // If insert fails, check if profile was created by trigger
          const { data: checkProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

          if (checkProfile) {
            profile = checkProfile
          } else {
            let errorMsg = 'エラー: プロフィールの作成に失敗しました。\n\n'
            if (profileError.message.includes('policy') || profileError.message.includes('RLS')) {
              errorMsg += 'RLSポリシーが設定されていない可能性があります。\n'
              errorMsg += 'SupabaseダッシュボードのSQL Editorで、supabase/migrations/003_add_profile_insert_policy.sql を実行してください。\n\n'
            }
            errorMsg += 'エラー詳細: ' + profileError.message
            setMessage(errorMsg)
            setLoading(false)
            return
          }
        } else {
          profile = newProfile
        }
      }

      const farmId = profile.id

      // Create herd
      const { data: herd, error: herdError } = await supabase
        .from('herds')
        .insert({
          farm_id: farmId,
          name: '乳牛群1',
          animal_type: 'dairy',
        })
        .select()
        .single()

      if (herdError && !herdError.message.includes('duplicate')) {
        console.warn('Herd creation warning:', herdError)
      }

      const herdId = herd?.id

      // Create sample revenue data
      const revenueData = [
        { farm_id: farmId, revenue_type: 'milk', amount: 500000, transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], customer_name: '乳業会社A', description: '牛乳販売' },
        { farm_id: farmId, revenue_type: 'milk', amount: 480000, transaction_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], customer_name: '乳業会社A', description: '牛乳販売' },
        { farm_id: farmId, revenue_type: 'calf', amount: 150000, transaction_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], customer_name: '畜産農家B', description: '子牛販売' },
        { farm_id: farmId, revenue_type: 'milk', amount: 520000, transaction_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], customer_name: '乳業会社A', description: '牛乳販売' },
        { farm_id: farmId, revenue_type: 'other', amount: 50000, transaction_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'その他収益' },
      ]

      const { error: revenueError } = await supabase
        .from('revenue')
        .upsert(revenueData, { onConflict: 'id', ignoreDuplicates: true })

      if (revenueError) {
        console.warn('Revenue creation warning:', revenueError)
      }

      // Create sample expense data
      const expenseData = [
        { farm_id: farmId, category: 'feed_roughage', amount: 200000, transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vendor_name: '飼料会社C', description: '粗飼料購入' },
        { farm_id: farmId, category: 'feed_concentrate', amount: 150000, transaction_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vendor_name: '飼料会社C', description: '濃厚飼料購入' },
        { farm_id: farmId, category: 'veterinary', amount: 50000, transaction_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vendor_name: '動物病院D', description: '診療費' },
        { farm_id: farmId, category: 'labor', amount: 300000, transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: '人件費' },
        { farm_id: farmId, category: 'fuel', amount: 80000, transaction_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vendor_name: 'ガソリンスタンドE', description: '燃料費' },
        { farm_id: farmId, category: 'utilities', amount: 60000, transaction_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vendor_name: '電力会社F', description: '光熱費' },
      ]

      const { error: expenseError } = await supabase
        .from('expenses')
        .upsert(expenseData, { onConflict: 'id', ignoreDuplicates: true })

      if (expenseError) {
        console.warn('Expense creation warning:', expenseError)
      }

      // Create sample subsidy data
      const subsidyData = [
        { farm_id: farmId, name: '酪農経営安定対策事業', expected_amount: 1000000, application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'applied' },
        { farm_id: farmId, name: '畜産環境整備事業', expected_amount: 500000, actual_amount: 500000, application_deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'paid' },
        { farm_id: farmId, name: '飼料価格高騰対策事業', expected_amount: 300000, application_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'approved' },
      ]

      const { error: subsidyError } = await supabase
        .from('subsidies')
        .upsert(subsidyData, { onConflict: 'id', ignoreDuplicates: true })

      if (subsidyError) {
        console.warn('Subsidy creation warning:', subsidyError)
      }

      // Create additional herds
      const additionalHerds = [
        { farm_id: farmId, name: '肉牛群1', animal_type: 'beef' },
        { farm_id: farmId, name: '乳牛群2', animal_type: 'dairy' },
      ]

      const { error: herdsError } = await supabase
        .from('herds')
        .upsert(additionalHerds, { onConflict: 'id', ignoreDuplicates: true })

      if (herdsError) {
        console.warn('Herds creation warning:', herdsError)
      }

      setMessage('初期データの作成が完了しました！')
    } catch (err) {
      setMessage('エラー: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>初期データ作成</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                テスト用の初期データを作成します。以下のデータが作成されます：
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-600 space-y-2">
                <li>プロフィール（テスト農場）</li>
                <li>収益データ（5件）</li>
                <li>支出データ（6件）</li>
                <li>補助金・助成金データ（3件）</li>
                <li>畜群データ（3件）</li>
              </ul>
              {message && (
                <div className={`mb-4 p-4 rounded ${message.includes('エラー') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message}
                </div>
              )}
              <Button onClick={createSeedData} disabled={loading}>
                {loading ? '作成中...' : '初期データを作成'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

