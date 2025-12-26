'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NewRevenuePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    revenue_type: 'milk',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    customer_name: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Get first profile as default (no auth required)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()

    if (!profile) {
      alert('プロフィールが見つかりません。まずプロフィールを作成してください。')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('revenue')
      .insert({
        farm_id: profile.id,
        revenue_type: formData.revenue_type,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date,
        customer_name: formData.customer_name || null,
        description: formData.description || null,
      })

    if (error) {
      alert('登録に失敗しました: ' + error.message)
      setLoading(false)
    } else {
      router.push('/revenue')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">収益登録</h1>
            <Link href="/revenue">
              <Button variant="outline">キャンセル</Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>新規収益</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    収益種別
                  </label>
                  <select
                    value={formData.revenue_type}
                    onChange={(e) => setFormData({ ...formData, revenue_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="milk">牛乳販売</option>
                    <option value="carcass">枝肉販売</option>
                    <option value="calf">子牛販売</option>
                    <option value="other">その他</option>
                    <option value="subsidy">補助金・助成金</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    金額
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    取引日
                  </label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    顧客名（任意）
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    備考（任意）
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Link href="/revenue">
                    <Button type="button" variant="outline">キャンセル</Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? '登録中...' : '登録'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


