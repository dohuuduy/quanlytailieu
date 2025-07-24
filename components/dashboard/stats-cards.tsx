'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'

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
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Tổng tài liệu"
        value="156"
        description="Tất cả tài liệu trong hệ thống"
        icon={<FileText className="h-4 w-4" />}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Đang hiệu lực"
        value="142"
        description="Tài liệu đang có hiệu lực"
        icon={<CheckCircle className="h-4 w-4" />}
        trend={{ value: 8, isPositive: true }}
      />
      <StatsCard
        title="Chờ phê duyệt"
        value="8"
        description="Tài liệu đang chờ duyệt"
        icon={<Clock className="h-4 w-4" />}
        trend={{ value: -2, isPositive: false }}
      />
      <StatsCard
        title="Sắp hết hạn"
        value="6"
        description="Tài liệu sắp hết hiệu lực"
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={{ value: 3, isPositive: false }}
      />
    </div>
  )
}