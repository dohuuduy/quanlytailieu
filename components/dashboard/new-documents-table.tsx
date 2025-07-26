'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { FileText, Eye, Calendar, User } from 'lucide-react'
import Link from 'next/link'

interface NewDocument {
  id: string
  ma_tai_lieu: string
  ten_tai_lieu: string
  phien_ban: string
  ngay_ban_hanh: string
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
  nguoi_ban_hanh: {
    ho_ten: string
  }
  loai_tai_lieu: {
    ten_loai: string
  }
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

export function NewDocumentsTable() {
  const [documents, setDocuments] = useState<NewDocument[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchNewDocuments()
  }, [])

  const fetchNewDocuments = async () => {
    try {
      setLoading(true)
      
      // Lấy tài liệu mới trong 30 ngày gần nhất, giới hạn 10 tài liệu
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data, error } = await supabase
        .from('ho_so')
        .select(`
          id,
          ma_tai_lieu,
          ten_tai_lieu,
          phien_ban,
          ngay_ban_hanh,
          tinh_trang,
          nguoi_ban_hanh:nguoi_dung!nguoi_ban_hanh_id(ho_ten),
          loai_tai_lieu(ten_loai)
        `)
        .gte('ngay_ban_hanh', thirtyDaysAgo.toISOString().split('T')[0])
        .order('ngay_ban_hanh', { ascending: false })
        .limit(10)

      if (error) throw error

      setDocuments(data || [])
    } catch (error) {
      console.error('Lỗi khi tải tài liệu mới:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tài liệu mới",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Tài liệu mới ban hành
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
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <span className="truncate">Tài liệu mới ban hành</span>
        </CardTitle>
        <Link href="/ho-so">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Xem tất cả
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">Không có tài liệu mới trong 30 ngày qua</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-3 sm:gap-0">
                <div className="flex-1 min-w-0">
                  {/* Title and badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm line-clamp-2 sm:truncate flex-1">
                      {doc.ten_tai_lieu}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {doc.phien_ban}
                      </Badge>
                      <Badge variant="outline" className={`text-xs shrink-0 ${tinhTrangColors[doc.tinh_trang]}`}>
                        {tinhTrangLabels[doc.tinh_trang]}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Document info - Stack on mobile, inline on desktop */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">{doc.ma_tai_lieu}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{formatDate(doc.ngay_ban_hanh)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{doc.nguoi_ban_hanh?.ho_ten}</span>
                    </span>
                  </div>
                  
                  {/* Document type */}
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {doc.loai_tai_lieu?.ten_loai}
                    </Badge>
                  </div>
                </div>
                
                {/* Action button */}
                <div className="flex items-center justify-end sm:ml-4">
                  <Link href={`/ho-so/${doc.id}`}>
                    <Button variant="outline" size="sm" className="h-8 w-full sm:w-8 sm:p-0">
                      <Eye className="h-4 w-4 sm:mr-0 mr-2" />
                      <span className="sm:hidden">Xem chi tiết</span>
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