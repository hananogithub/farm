'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NewSubsidyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    expected_amount: '',
    actual_amount: '',
    application_deadline: '',
    payment_date: '',
    status: 'applied',
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
      .from('subsidies')
      .insert({
        farm_id: profile.id,
        name: formData.name,
        expected_amount: parseFloat(formData.expected_amount),
        actual_amount: formData.actual_amount ? parseFloat(formData.actual_amount) : null,
        application_deadline: formData.application_deadline || null,
        payment_date: formData.payment_date || null,
        status: formData.status,
      })

    if (error) {
      alert('登録に失敗しました: ' + error.message)
      setLoading(false)
    } else {
      router.push('/subsidies')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">補助金・助成金登録</h1>
            <Link href="/subsidies">
              <Button variant="outline">キャンセル</Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>新規補助金・助成金</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    名称
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    予定額
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.expected_amount}
                    onChange={(e) => setFormData({ ...formData, expected_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    実績額（任意）
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.actual_amount}
                    onChange={(e) => setFormData({ ...formData, actual_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    申請期限（任意）
                  </label>
                  <input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    支払日（任意）
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    ステータス
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="applied">申請済み</option>
                    <option value="approved">承認済み</option>
                    <option value="paid">支払済み</option>
                    <option value="rejected">却下</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <Link href="/subsidies">
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


