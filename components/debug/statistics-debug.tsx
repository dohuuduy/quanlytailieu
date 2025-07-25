'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupabaseClient } from '@/lib/supabase'

export function StatisticsDebug() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  const checkStatistics = async () => {
    setLoading(true)
    try {
      // Get all standards
      const { data: standards, error: standardsError } = await supabase
        .from('tieu_chuan')
        .select('id, ten_tieu_chuan')

      if (standardsError) throw standardsError

      const results = []
      
      for (const standard of standards || []) {
        const { data, error } = await supabase
          .from('tai_lieu_tieu_chuan')
          .select(`
            ho_so:ho_so_id (
              id,
              ma_tai_lieu,
              ten_tai_lieu,
              tinh_trang,
              ngay_het_hieu_luc
            )
          `)
          .eq('tieu_chuan_id', standard.id)

        if (error) {
          console.error(`Error for standard ${standard.ten_tieu_chuan}:`, error)
          continue
        }

        const documents = data?.map((item: any) => item.ho_so).filter((doc: any) => doc !== null) || []
        
        const today = new Date()
        const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
        
        const stats = {
          standard: standard.ten_tieu_chuan,
          standard_id: standard.id,
          total: documents.length,
          hieu_luc: documents.filter(d => d.tinh_trang === 'hieu_luc').length,
          cho_duyet: documents.filter(d => d.tinh_trang === 'cho_duyet').length,
          het_hieu_luc: documents.filter(d => d.tinh_trang === 'het_hieu_luc').length,
          expiring: documents.filter(d => {
            if (!d.ngay_het_hieu_luc || d.tinh_trang !== 'hieu_luc') return false
            const expiryDate = new Date(d.ngay_het_hieu_luc)
            return expiryDate >= today && expiryDate <= thirtyDaysFromNow
          }).length,
          documents: documents.slice(0, 3) // Only show first 3 for brevity
        }
        
        results.push(stats)
      }

      setResult(results)
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const addSampleData = async () => {
    setLoading(true)
    try {
      // Update existing documents with expiry dates
      const updates = [
        { ma_tai_lieu: 'QT-001', ngay_het_hieu_luc: '2024-08-15' },
        { ma_tai_lieu: 'CS-003', ngay_het_hieu_luc: '2024-12-31' }
      ]

      const results = []
      for (const update of updates) {
        const { data, error } = await supabase
          .from('ho_so')
          .update({ ngay_het_hieu_luc: update.ngay_het_hieu_luc })
          .eq('ma_tai_lieu', update.ma_tai_lieu)
          .select()

        if (error) {
          console.error(`Error updating ${update.ma_tai_lieu}:`, error)
        } else {
          results.push({ updated: update.ma_tai_lieu, data })
        }
      }

      setResult({ message: 'Updated sample data', results })
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>🔧 Debug Thống kê</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={checkStatistics} disabled={loading} size="sm">
            Kiểm tra thống kê
          </Button>
          <Button onClick={addSampleData} disabled={loading} size="sm" variant="outline">
            Thêm dữ liệu mẫu
          </Button>
        </div>

        {result && (
          <div className="mt-4">
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}