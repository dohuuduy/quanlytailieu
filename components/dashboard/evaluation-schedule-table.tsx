'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle, CheckCircle, Eye, Plus } from 'lucide-react'
import Link from 'next/link'

// Dữ liệu mẫu cho lịch đánh giá (sẽ được thay thế bằng dữ liệu thực từ database sau)
interface EvaluationSchedule {
  id: string
  ten_danh_gia: string
  loai_danh_gia: 'noi_bo' | 'ben_thu_ba' | 'khach_hang'
  ngay_bat_dau: string
  ngay_ket_thuc: string
  trang_thai: 'sap_toi' | 'dang_thuc_hien' | 'hoan_thanh' | 'qua_han'
  nguoi_phu_trach: string
  tieu_chuan_ap_dung: string[]
  ghi_chu?: string
}

const mockEvaluationData: EvaluationSchedule[] = [
  {
    id: '1',
    ten_danh_gia: 'Đánh giá nội bộ ISO 9001:2015',
    loai_danh_gia: 'noi_bo',
    ngay_bat_dau: '2025-02-15',
    ngay_ket_thuc: '2025-02-20',
    trang_thai: 'sap_toi',
    nguoi_phu_trach: 'Nguyễn Văn A',
    tieu_chuan_ap_dung: ['ISO 9001:2015'],
    ghi_chu: 'Đánh giá định kỳ 6 tháng'
  },
  {
    id: '2',
    ten_danh_gia: 'Audit BRC v9 bởi SGS',
    loai_danh_gia: 'ben_thu_ba',
    ngay_bat_dau: '2025-03-01',
    ngay_ket_thuc: '2025-03-03',
    trang_thai: 'sap_toi',
    nguoi_phu_trach: 'Trần Thị B',
    tieu_chuan_ap_dung: ['BRC v9'],
    ghi_chu: 'Audit tái chứng nhận'
  },
  {
    id: '3',
    ten_danh_gia: 'Đánh giá SMETA 4-Pillar',
    loai_danh_gia: 'ben_thu_ba',
    ngay_bat_dau: '2025-02-10',
    ngay_ket_thuc: '2025-02-12',
    trang_thai: 'dang_thuc_hien',
    nguoi_phu_trach: 'Lê Văn C',
    tieu_chuan_ap_dung: ['SMETA'],
    ghi_chu: 'Audit theo yêu cầu khách hàng'
  },
  {
    id: '4',
    ten_danh_gia: 'Đánh giá nội bộ HACCP',
    loai_danh_gia: 'noi_bo',
    ngay_bat_dau: '2025-01-20',
    ngay_ket_thuc: '2025-01-22',
    trang_thai: 'hoan_thanh',
    nguoi_phu_trach: 'Phạm Thị D',
    tieu_chuan_ap_dung: ['HACCP'],
    ghi_chu: 'Đánh giá hàng tháng'
  },
  {
    id: '5',
    ten_danh_gia: 'Customer Audit - ABC Corp',
    loai_danh_gia: 'khach_hang',
    ngay_bat_dau: '2025-02-25',
    ngay_ket_thuc: '2025-02-26',
    trang_thai: 'sap_toi',
    nguoi_phu_trach: 'Hoàng Văn E',
    tieu_chuan_ap_dung: ['BRC v9', 'ISO 9001:2015'],
    ghi_chu: 'Audit khách hàng lớn'
  }
]

const loaiDanhGiaColors = {
  noi_bo: 'bg-blue-100 text-blue-800',
  ben_thu_ba: 'bg-purple-100 text-purple-800',
  khach_hang: 'bg-green-100 text-green-800'
}

const loaiDanhGiaLabels = {
  noi_bo: 'Nội bộ',
  ben_thu_ba: 'Bên thứ ba',
  khach_hang: 'Khách hàng'
}

const trangThaiColors = {
  sap_toi: 'bg-yellow-100 text-yellow-800',
  dang_thuc_hien: 'bg-blue-100 text-blue-800',
  hoan_thanh: 'bg-green-100 text-green-800',
  qua_han: 'bg-red-100 text-red-800'
}

const trangThaiLabels = {
  sap_toi: 'Sắp tới',
  dang_thuc_hien: 'Đang thực hiện',
  hoan_thanh: 'Hoàn thành',
  qua_han: 'Quá hạn'
}

export function EvaluationScheduleTable() {
  const [evaluations, setEvaluations] = useState<EvaluationSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Lọc chỉ lấy các đánh giá sắp tới và đang thực hiện
      const upcomingEvaluations = mockEvaluationData.filter(
        evaluation => evaluation.trang_thai === 'sap_toi' || evaluation.trang_thai === 'dang_thuc_hien'
      )
      setEvaluations(upcomingEvaluations)
      setLoading(false)
    }, 1000)
  }, [])

  const getDaysUntilStart = (startDate: string) => {
    const today = new Date()
    const start = new Date(startDate)
    const diffTime = start.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('vi-VN')
    const end = new Date(endDate).toLocaleDateString('vi-VN')
    return `${start} - ${end}`
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Lịch đánh giá sắp tới
          {evaluations.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {evaluations.length}
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm lịch
          </Button>
          <Button variant="outline" size="sm">
            Xem tất cả
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {evaluations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">Không có lịch đánh giá nào sắp tới</p>
            <Button variant="outline" size="sm" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Thêm lịch đánh giá
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => {
              const daysUntilStart = getDaysUntilStart(evaluation.ngay_bat_dau)
              
              return (
                <div key={evaluation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm truncate">{evaluation.ten_danh_gia}</h4>
                      <Badge variant="outline" className={`text-xs ${loaiDanhGiaColors[evaluation.loai_danh_gia]}`}>
                        {loaiDanhGiaLabels[evaluation.loai_danh_gia]}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${trangThaiColors[evaluation.trang_thai]}`}>
                        {trangThaiLabels[evaluation.trang_thai]}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateRange(evaluation.ngay_bat_dau, evaluation.ngay_ket_thuc)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {evaluation.nguoi_phu_trach}
                      </span>
                      {evaluation.trang_thai === 'sap_toi' && daysUntilStart >= 0 && (
                        <span className={`flex items-center gap-1 ${daysUntilStart <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                          <AlertCircle className="h-3 w-3" />
                          {daysUntilStart === 0 ? 'Hôm nay' : 
                           daysUntilStart === 1 ? 'Ngày mai' : 
                           `${daysUntilStart} ngày nữa`}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {evaluation.tieu_chuan_ap_dung.map((standard, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {standard}
                        </Badge>
                      ))}
                    </div>
                    
                    {evaluation.ghi_chu && (
                      <p className="text-xs text-muted-foreground italic">
                        {evaluation.ghi_chu}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
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