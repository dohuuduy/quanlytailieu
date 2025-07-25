'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { AlertTriangle, Eye, Calendar, User, Clock } from 'lucide-react'
import Link from 'next/link'

interface ExpiringDocument {
  id: string
  ma_tai_lieu: string
  ten_tai_lieu: string
  phien_ban: string
  ngay_het_hieu_luc: string
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
  nguoi_ban_hanh: {
    ho_ten: string
  }
  loai_tai_lieu: {
    ten_loai: string
  }
  days_until_expiry?: number
}

const tinhTrangColors = {
  hieu_luc: 'bg-green-100 text-green-800',
  cho_duyet: 'bg-yellow-100 text-yellow-800',
  het_hieu_luc: 'bg-red-100 text-red-800'
}

const tinhTrangLabels = {
  hieu_luc: 'Hiệu lực',
  cho_duyet: 'Chờ duyệt',
  het_hieu_luc: 'Hết hiệu lực'
}

export function ExpiringDocumentsTable() {
  const [documents, setDocuments] = useState<ExpiringDocument[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchExpiringDocuments()
  }, [])

  const fetchExpiringDocuments = async () => {
    try {
      setLoading(true)
      
      // Lấy tài liệu sẽ hết hạn trong 30 ngày tới
      const today = new Date()
      const thirtyDaysLater = new Date()
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
      
      const { data, error } = await supabase
        .from('ho_so')
        .select(`
          id,
          ma_tai_lieu,
          ten_tai_lieu,
          phien_ban,
          ngay_het_hieu_luc,
          tinh_trang,
          nguoi_ban_hanh:nguoi_dung!nguoi_ban_hanh_id(ho_ten),
          loai_tai_lieu(ten_loai)
        `)
        .not('ngay_het_hieu_luc', 'is', null)
        .gte('ngay_het_hieu_luc', today.toISOString().split('T')[0])
        .lte('ngay_het_hieu_luc', thirtyDaysLater.toISOString().split('T')[0])
        .eq('tinh_trang', 'hieu_luc')
        .order('ngay_het_hieu_luc', { ascending: true })

      if (error) throw error

      // Tính số ngày còn lại đến hết hạn
      const documentsWithDays = (data || []).map((doc: any) => {
        const expiryDate = new Date(doc.ngay_het_hieu_luc)
        const diffTime = expiryDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        return {
          ...doc,
          days_until_expiry: diffDays
        }
      })

      setDocuments(documentsWithDays)
    } catch (error) {
      console.error('Lỗi khi tải tài liệu sắp hết hạn:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tài liệu sắp hết hạn",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'bg-red-100 text-red-800 border-red-200'
    if (days <= 15) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  const getUrgencyLabel = (days: number) => {
    if (days <= 0) return 'Đã hết hạn'
    if (days === 1) return '1 ngày nữa'
    return `${days} ngày nữa`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Tài liệu sắp hết hạn
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
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Tài liệu sắp hết hạn
          {documents.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {documents.length}
            </Badge>
          )}
        </CardTitle>
        <Link href="/ho-so?filter=expiring">
          <Button variant="outline" size="sm">
            Xem tất cả
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">Không có tài liệu nào sắp hết hạn trong 30 ngày tới</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm truncate">{doc.ten_tai_lieu}</h4>
                    <Badge variant="outline" className="text-xs">
                      {doc.phien_ban}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getUrgencyColor(doc.days_until_expiry || 0)}`}
                    >
                      {getUrgencyLabel(doc.days_until_expiry || 0)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {doc.ma_tai_lieu}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Hết hạn: {formatDate(doc.ngay_het_hieu_luc)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {doc.nguoi_ban_hanh?.ho_ten}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {doc.loai_tai_lieu?.ten_loai}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/ho-so/${doc.id}`}>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}