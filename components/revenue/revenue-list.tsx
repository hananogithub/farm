'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Revenue {
  id: string
  revenue_type: string
  amount: number
  transaction_date: string
  customer_name: string | null
  description: string | null
}

export default function RevenueList({ farmId, canEdit }: { farmId: string; canEdit: boolean }) {
  const supabase = createClient()
  const [revenue, setRevenue] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRevenue()
  }, [farmId])

  const loadRevenue = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('revenue')
        .select('*')
      
      if (farmId) {
        query = query.eq('farm_id', farmId)
      }
      
      const { data, error } = await query.order('transaction_date', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error loading revenue:', error.message || error)
        setRevenue([])
      } else {
        setRevenue(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading revenue:', err)
      setRevenue([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この収益を削除しますか？')) return

    const { error } = await supabase
      .from('revenue')
      .delete()
      .eq('id', id)

    if (error) {
      alert('削除に失敗しました: ' + error.message)
    } else {
      loadRevenue()
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  const revenueTypeLabels: Record<string, string> = {
    milk: '牛乳販売',
    carcass: '枝肉販売',
    calf: '子牛販売',
    other: 'その他',
    subsidy: '補助金・助成金',
  }

  return (
    <Card>
      <CardContent className="p-6">
        {revenue.length === 0 ? (
          <p className="text-gray-900 text-center py-8">収益データがありません</p>
        ) : (
          <div className="space-y-4">
            {revenue.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-4 last:border-0"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {revenueTypeLabels[item.revenue_type] || item.revenue_type}
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDate(item.transaction_date)}
                    {item.customer_name && ` • ${item.customer_name}`}
                  </div>
                  {item.description && (
                    <div className="text-sm text-gray-900 mt-1">{item.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(item.amount)}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Link href={`/revenue/${item.id}/edit`}>
                        <Button variant="outline" size="sm">編集</Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        削除
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


