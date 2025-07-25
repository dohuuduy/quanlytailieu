'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'

interface Document {
  id: string
  tinh_trang: string
  ngay_het_hieu_luc: string | null
}

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className={`h-3 w-3 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs ml-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">so với tháng trước</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    hieu_luc: 0,
    cho_duyet: 0,
    expiring: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Lấy tất cả tài liệu
      const { data: documents, error } = await supabase
        .from('ho_so')
        .select('id, tinh_trang, ngay_het_hieu_luc')

      const typedDocuments = documents as Document[] | null

      if (error) throw error

      // Tính toán thống kê
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))

      const statistics = {
        total: typedDocuments?.length || 0,
        hieu_luc: typedDocuments?.filter(doc => doc.tinh_trang === 'hieu_luc').length || 0,
        cho_duyet: typedDocuments?.filter(doc => doc.tinh_trang === 'cho_duyet').length || 0,
        expiring: typedDocuments?.filter(doc => {
          if (!doc.ngay_het_hieu_luc || doc.tinh_trang !== 'hieu_luc') return false
          const expiryDate = new Date(doc.ngay_het_hieu_luc)
          expiryDate.setHours(0, 0, 0, 0)
          return expiryDate >= today && expiryDate <= thirtyDaysFromNow
        }).length || 0
      }

      console.log('Dashboard stats:', statistics)
      setStats(statistics)
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang tải...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Tổng tài liệu"
        value={stats.total}
        description="Tất cả tài liệu trong hệ thống"
        icon={<FileText className="h-4 w-4" />}
      />
      <StatsCard
        title="Đang hiệu lực"
        value={stats.hieu_luc}
        description="Tài liệu đang có hiệu lực"
        icon={<CheckCircle className="h-4 w-4" />}
      />
      <StatsCard
        title="Chờ phê duyệt"
        value={stats.cho_duyet}
        description="Tài liệu đang chờ duyệt"
        icon={<Clock className="h-4 w-4" />}
      />
      <StatsCard
        title="Sắp hết hạn"
        value={stats.expiring}
        description="Tài liệu sắp hết hiệu lực (30 ngày)"
        icon={<AlertTriangle className="h-4 w-4" />}
      />
    </div>
  )
}