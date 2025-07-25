'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function TestDbPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  const getStandardIds = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tieu_chuan')
        .select('id, ten_tieu_chuan')

      if (error) throw error
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkAllDocuments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ho_so')
        .select(`
          id,
          ma_tai_lieu,
          ten_tai_lieu,
          tinh_trang,
          ngay_het_hieu_luc,
          ngay_ban_hanh
        `)

      if (error) throw error
      setResult({ 
        total_documents: data?.length || 0,
        documents: data 
      })
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkDocumentsByStandard = async () => {
    setLoading(true)
    try {
      // First get all standards
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
          documents: documents
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

  const insertSampleData = async () => {
    setLoading(true)
    try {
      // Update existing documents with expiry dates
      const { data: hoSoData, error: hoSoError } = await supabase
        .from('ho_so')
        .update({ 
          ngay_het_hieu_luc: '2024-08-15' 
        })
        .eq('ma_tai_lieu', 'QT-001')
        .select()

      if (hoSoError) {
        console.error('Update error:', hoSoError)
      }

      const { data: hoSoData2, error: hoSoError2 } = await supabase
        .from('ho_so')
        .update({ 
          ngay_het_hieu_luc: '2024-12-31' 
        })
        .eq('ma_tai_lieu', 'CS-003')
        .select()

      if (hoSoError2) {
        console.error('Update error 2:', hoSoError2)
      }

      setResult({ 
        message: 'Updated sample data',
        updated1: hoSoData,
        updated2: hoSoData2
      })
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Test & Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={getStandardIds} disabled={loading}>
                Get All Standards
              </Button>
              <Button onClick={checkAllDocuments} disabled={loading}>
                Check All Documents
              </Button>
              <Button onClick={checkDocumentsByStandard} disabled={loading}>
                Check Statistics by Standard
              </Button>
              <Button onClick={insertSampleData} disabled={loading}>
                Update Sample Data
              </Button>
            </div>

            {result && (
              <div className="mt-4">
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}