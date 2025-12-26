'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Herd {
  id: string
  name: string
  animal_type: string
  created_at: string
}

export default function HerdList({ farmId, canEdit }: { farmId: string; canEdit: boolean }) {
  const supabase = createClient()
  const [herds, setHerds] = useState<Herd[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHerds()
  }, [farmId])

  const loadHerds = async () => {
    const { data, error } = await supabase
      .from('herds')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading herds:', error)
    } else {
      setHerds(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この畜群を削除しますか？')) return

    const { error } = await supabase
      .from('herds')
      .delete()
      .eq('id', id)

    if (error) {
      alert('削除に失敗しました: ' + error.message)
    } else {
      loadHerds()
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  const animalTypeLabels: Record<string, string> = {
    dairy: '乳牛',
    beef: '肉牛',
    other: 'その他',
  }

  return (
    <Card>
      <CardContent className="p-6">
        {herds.length === 0 ? (
          <p className="text-gray-500 text-center py-8">畜群データがありません</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {herds.map((herd) => (
              <div
                key={herd.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{herd.name}</h3>
                    <p className="text-sm text-gray-500">
                      {animalTypeLabels[herd.animal_type] || herd.animal_type}
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2 mt-4">
                    <Link href={`/herds/${herd.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        詳細
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(herd.id)}
                    >
                      削除
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


