'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NewHerdPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    animal_type: 'dairy',
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
      .from('herds')
      .insert({
        farm_id: profile.id,
        name: formData.name,
        animal_type: formData.animal_type,
      })

    if (error) {
      alert('登録に失敗しました: ' + error.message)
      setLoading(false)
    } else {
      router.push('/herds')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">畜群登録</h1>
            <Link href="/herds">
              <Button variant="outline">キャンセル</Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>新規畜群</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    畜群名
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
                    家畜種別
                  </label>
                  <select
                    value={formData.animal_type}
                    onChange={(e) => setFormData({ ...formData, animal_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="dairy">乳牛</option>
                    <option value="beef">肉牛</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <Link href="/herds">
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


