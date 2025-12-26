'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Subsidy {
  id: string
  name: string
  expected_amount: number
  actual_amount: number | null
  application_deadline: string | null
  payment_date: string | null
  status: string
}

export default function SubsidyList({ farmId, canEdit }: { farmId: string; canEdit: boolean }) {
  const supabase = createClient()
  const [subsidies, setSubsidies] = useState<Subsidy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubsidies()
  }, [farmId])

  const loadSubsidies = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('subsidies')
        .select('*')
      
      if (farmId) {
        query = query.eq('farm_id', farmId)
      }
      
      const { data, error } = await query.order('application_deadline', { ascending: true, nullsLast: true })

      if (error) {
        console.error('Error loading subsidies:', error.message || error)
        setSubsidies([])
      } else {
        setSubsidies(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading subsidies:', err)
      setSubsidies([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  const statusLabels: Record<string, string> = {
    applied: '申請済み',
    approved: '承認済み',
    paid: '支払済み',
    rejected: '却下',
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600'
      case 'approved':
        return 'text-blue-600'
      case 'rejected':
        return 'text-red-600'
      default:
        return 'text-gray-900'
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {subsidies.length === 0 ? (
          <p className="text-gray-900 text-center py-8">補助金・助成金データがありません</p>
        ) : (
          <div className="space-y-4">
            {subsidies.map((subsidy) => (
              <div
                key={subsidy.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{subsidy.name}</h3>
                      <span className={`text-sm font-medium ${getStatusColor(subsidy.status)}`}>
                        {statusLabels[subsidy.status] || subsidy.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-900">
                      <div>
                        予定額: <span className="font-medium">{formatCurrency(subsidy.expected_amount)}</span>
                      </div>
                      {subsidy.actual_amount && (
                        <div>
                          実績額: <span className="font-medium">{formatCurrency(subsidy.actual_amount)}</span>
                        </div>
                      )}
                      {subsidy.application_deadline && (
                        <div>
                          申請期限: {formatDate(subsidy.application_deadline)}
                        </div>
                      )}
                      {subsidy.payment_date && (
                        <div>
                          支払日: {formatDate(subsidy.payment_date)}
                        </div>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <Link href={`/subsidies/${subsidy.id}/edit`}>
                      <Button variant="outline" size="sm">編集</Button>
                    </Link>
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


