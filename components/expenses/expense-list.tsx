'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Expense {
  id: string
  category: string
  amount: number
  transaction_date: string
  vendor_name: string | null
  description: string | null
}

export default function ExpenseList({ farmId, canEdit }: { farmId: string; canEdit: boolean }) {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExpenses()
  }, [farmId])

  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('farm_id', farmId)
      .order('transaction_date', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error loading expenses:', error)
    } else {
      setExpenses(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この支出を削除しますか？')) return

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      alert('削除に失敗しました: ' + error.message)
    } else {
      loadExpenses()
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  const categoryLabels: Record<string, string> = {
    feed_roughage: '飼料（粗飼料）',
    feed_concentrate: '飼料（濃厚飼料）',
    veterinary: '獣医・薬品',
    labor: '人件費',
    fuel: '燃料',
    utilities: '光熱費',
    repairs: '修繕費',
    machinery: '機械・設備',
    livestock_purchase: '家畜購入',
    losses: '事故・疾病による損失',
    other: 'その他',
  }

  return (
    <Card>
      <CardContent className="p-6">
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">支出データがありません</p>
        ) : (
          <div className="space-y-4">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-4 last:border-0"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {categoryLabels[item.category] || item.category}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(item.transaction_date)}
                    {item.vendor_name && ` • ${item.vendor_name}`}
                  </div>
                  {item.description && (
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold text-red-600">
                    {formatCurrency(item.amount)}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Link href={`/expenses/${item.id}/edit`}>
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


