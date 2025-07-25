'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Activity, FileText, User, Edit, Plus, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  hanh_dong: 'tao_moi' | 'cap_nhat' | 'phe_duyet' | 'huy_bo'
  ngay_thuc_hien: string
  ghi_chu: string | null
  nguoi_thuc_hien: {
    ho_ten: string
  }
  ho_so: {
    id: string
    ma_tai_lieu: string
    ten_tai_lieu: string
  }
}

const actionIcons = {
  tao_moi: Plus,
  cap_nhat: Edit,
  phe_duyet: CheckCircle,
  huy_bo: XCircle
}

const actionColors = {
  tao_moi: 'bg-blue-100 text-blue-800',
  cap_nhat: 'bg-yellow-100 text-yellow-800',
  phe_duyet: 'bg-green-100 text-green-800',
  huy_bo: 'bg-red-100 text-red-800'
}

const actionLabels = {
  tao_moi: 'Tạo mới',
  cap_nhat: 'Cập nhật',
  phe_duyet: 'Phê duyệt',
  huy_bo: 'Hủy bỏ'
}

export function EnhancedActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('lich_su_ho_so')
        .select(`
          id,
          hanh_dong,
          ngay_thuc_hien,
          ghi_chu,
          nguoi_thuc_hien:nguoi_dung!nguoi_thuc_hien_id(ho_ten),
          ho_so:ho_so_id(id, ma_tai_lieu, ten_tai_lieu)
        `)
        .order('ngay_thuc_hien', { ascending: false })
        .limit(15)

      if (error) throw error

      setActivities(data || [])
    } catch (error) {
      console.error('Lỗi khi tải lịch sử hoạt động:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử hoạt động",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Vừa xong'
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ngày trước`
    
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Hoạt động gần đây
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchActivities}>
          <Clock className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const ActionIcon = actionIcons[activity.hanh_dong]
              
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={`p-2 rounded-full ${actionColors[activity.hanh_dong]}`}>
                    <ActionIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs ${actionColors[activity.hanh_dong]}`}>
                        {actionLabels[activity.hanh_dong]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(activity.ngay_thuc_hien)}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium mb-1">
                      <span className="text-muted-foreground">
                        {activity.nguoi_thuc_hien?.ho_ten}
                      </span>
                      {' '}
                      {activity.hanh_dong === 'tao_moi' && 'đã tạo mới tài liệu'}
                      {activity.hanh_dong === 'cap_nhat' && 'đã cập nhật tài liệu'}
                      {activity.hanh_dong === 'phe_duyet' && 'đã phê duyệt tài liệu'}
                      {activity.hanh_dong === 'huy_bo' && 'đã hủy bỏ tài liệu'}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/ho-so/${activity.ho_so?.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                      >
                        {activity.ho_so?.ma_tai_lieu} - {activity.ho_so?.ten_tai_lieu}
                      </Link>
                    </div>
                    
                    {activity.ghi_chu && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{activity.ghi_chu}"
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}