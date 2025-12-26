'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Profile {
  id: string
  user_id: string
  role: string
  farm_name: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    farm_name: '',
    role: 'owner',
  })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) {
        setError('プロフィールの読み込みに失敗しました: ' + profileError.message)
        setLoading(false)
        return
      }

      if (!profileData) {
        setError('プロフィールが見つかりません')
        setLoading(false)
        return
      }

      setProfile(profileData)
      setFormData({
        farm_name: profileData.farm_name || '',
        role: profileData.role || 'owner',
      })
    } catch (err) {
      setError('エラーが発生しました: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !profile) {
        setError('ユーザー情報が見つかりません')
        setSaving(false)
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          farm_name: formData.farm_name || null,
          role: formData.role,
        })
        .eq('user_id', user.id)

      if (updateError) {
        setError('更新に失敗しました: ' + updateError.message)
        setSaving(false)
        return
      }

      setMessage('プロフィールを更新しました')
      await loadProfile()
      
      // メッセージを3秒後に消す
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (err) {
      setError('エラーが発生しました: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-8">読み込み中...</div>
          </div>
        </div>
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    owner: 'オーナー',
    staff: 'スタッフ',
    accountant: '会計士',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">プロフィール編集</h1>
            <Link href="/dashboard">
              <Button variant="outline">キャンセル</Button>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">プロフィール情報</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    農場名
                  </label>
                  <input
                    type="text"
                    value={formData.farm_name}
                    onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="農場名を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    役割
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="owner">オーナー</option>
                    <option value="staff">スタッフ</option>
                    <option value="accountant">会計士</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    現在の役割: {roleLabels[profile?.role || 'owner'] || profile?.role}
                  </p>
                </div>

                {profile && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>作成日: {new Date(profile.created_at).toLocaleDateString('ja-JP')}</div>
                      <div>更新日: {new Date(profile.updated_at).toLocaleDateString('ja-JP')}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Link href="/dashboard">
                    <Button type="button" variant="outline">キャンセル</Button>
                  </Link>
                  <Button type="submit" disabled={saving}>
                    {saving ? '保存中...' : '保存'}
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

