'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle, Eye, Plus } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

// Interface cho lịch đánh giá từ database
interface EvaluationSchedule {
  id: string
  tieu_chuan_id: string
  ngay_du_kien: string
  ngay_bat_dau_thuc_te: string | null
  ngay_ket_thuc_thuc_te: string | null
  auditor: string | null
  to_chuc_danh_gia: string | null
  trang_thai: 'ke_hoach' | 'dang_thuc_hien' | 'hoan_thanh' | 'huy_bo'
  ghi_chu: string | null
  tieu_chuan?: {
    ten_tieu_chuan: string
  }
}

// Màu sắc và nhãn cho trạng thái
const trangThaiColors = {
  ke_hoach: 'bg-blue-100 text-blue-800',
  dang_thuc_hien: 'bg-yellow-100 text-yellow-800',
  hoan_thanh: 'bg-green-100 text-green-800',
  huy_bo: 'bg-red-100 text-red-800'
}

const trangThaiLabels = {
  ke_hoach: 'Kế hoạch',
  dang_thuc_hien: 'Đang thực hiện',
  hoan_thanh: 'Hoàn thành',
  huy_bo: 'Hủy bỏ'
}

export function EvaluationScheduleTable() {
  const [evaluations, setEvaluations] = useState<EvaluationSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchUpcomingEvaluations()
  }, [])

  const fetchUpcomingEvaluations = async () => {
    try {
      // Tính toán ngày hiện tại và ngày 30 ngày tới
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      const todayStr = today.toISOString().split('T')[0]
      const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0]

      // Lấy dữ liệu từ database với join tieu_chuan
      const { data, error } = await supabase
        .from('lich_danh_gia')
        .select(`
          *,
          tieu_chuan:tieu_chuan_id (
            ten_tieu_chuan
          )
        `)
        .gte('ngay_du_kien', todayStr)
        .lte('ngay_du_kien', thirtyDaysStr)
        .in('trang_thai', ['ke_hoach', 'dang_thuc_hien'])
        .order('ngay_du_kien', { ascending: true })

      if (error) {
        console.error('Lỗi khi lấy dữ liệu lịch đánh giá:', error)
        return
      }

      setEvaluations(data || [])
    } catch (error) {
      console.error('Lỗi khi fetch dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntilStart = (startDate: string) => {
    const today = new Date()
    const start = new Date(startDate)
    const diffTime = start.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatDateRange = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate).toLocaleDateString('vi-VN')
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString('vi-VN')
      return `${start} - ${end}`
    }
    return start
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Lịch đánh giá sắp tới
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
      <CardHeader className="flex flex-col gap-3 pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          <span className="truncate">Lịch đánh giá sắp tới</span>
          {evaluations.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {evaluations.length}
            </Badge>
          )}
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/lich-danh-gia/tao-moi" className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Thêm lịch
            </Button>
          </Link>
          <Link href="/lich-danh-gia" className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="w-full">
              Xem tất cả
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {evaluations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">Không có lịch đánh giá nào sắp tới</p>
            <Link href="/lich-danh-gia/tao-moi">
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Thêm lịch đánh giá
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map((evaluation) => {
              const daysUntilStart = getDaysUntilStart(evaluation.ngay_du_kien)

              return (
                <div key={evaluation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    {/* Title and status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm line-clamp-2 sm:truncate flex-1">
                        Đánh giá {evaluation.tieu_chuan?.ten_tieu_chuan || 'Tiêu chuẩn'}
                      </h4>
                      <Badge variant="outline" className={`text-xs shrink-0 ${trangThaiColors[evaluation.trang_thai]}`}>
                        {trangThaiLabels[evaluation.trang_thai]}
                      </Badge>
                    </div>

                    {/* Schedule info - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {evaluation.ngay_bat_dau_thuc_te && evaluation.ngay_ket_thuc_thuc_te
                            ? formatDateRange(evaluation.ngay_bat_dau_thuc_te, evaluation.ngay_ket_thuc_thuc_te)
                            : `Dự kiến: ${formatDate(evaluation.ngay_du_kien)}`
                          }
                        </span>
                      </span>
                      {evaluation.auditor && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="truncate">{evaluation.auditor}</span>
                        </span>
                      )}
                      {evaluation.trang_thai === 'ke_hoach' && daysUntilStart >= 0 && (
                        <span className={`flex items-center gap-1 ${daysUntilStart <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>
                            {daysUntilStart === 0 ? 'Hôm nay' :
                              daysUntilStart === 1 ? 'Ngày mai' :
                                `${daysUntilStart} ngày nữa`}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {evaluation.tieu_chuan?.ten_tieu_chuan && (
                        <Badge variant="secondary" className="text-xs">
                          {evaluation.tieu_chuan.ten_tieu_chuan}
                        </Badge>
                      )}
                      {evaluation.to_chuc_danh_gia && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                          {evaluation.to_chuc_danh_gia}
                        </Badge>
                      )}
                    </div>

                    {/* Notes */}
                    {evaluation.ghi_chu && (
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        {evaluation.ghi_chu}
                      </p>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="flex items-center justify-end sm:ml-4">
                    <Link href={`/lich-danh-gia/${evaluation.id}`}>
                      <Button variant="outline" size="sm" className="h-8 w-full sm:w-8 sm:p-0">
                        <Eye className="h-4 w-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Xem chi tiết</span>
                      </Button>
                    </Link>
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