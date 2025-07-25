'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building,
  Award,
  XCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface LichDanhGia {
  id: string
  tieu_chuan: {
    ten_tieu_chuan: string
  }
  ngay_du_kien: string
  ngay_bat_dau_thuc_te: string | null
  ngay_ket_thuc_thuc_te: string | null
  auditor: string | null
  to_chuc_danh_gia: string | null
  trang_thai: 'ke_hoach' | 'dang_thuc_hien' | 'hoan_thanh' | 'huy_bo'
  ghi_chu: string | null
  created_at: string
  updated_at: string
}

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

export default function ChiTietLichDanhGiaPage() {
  const [lichDanhGia, setLichDanhGia] = useState<LichDanhGia | null>(null)
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()
  const params = useParams()
  const supabase = createSupabaseClient()
  const lichDanhGiaId = params.id as string

  useEffect(() => {
    if (lichDanhGiaId) {
      fetchLichDanhGia()
    }
  }, [lichDanhGiaId])

  const fetchLichDanhGia = async () => {
    try {
      const { data, error } = await supabase
        .from('lich_danh_gia')
        .select(`
          *,
          tieu_chuan(ten_tieu_chuan)
        `)
        .eq('id', lichDanhGiaId)
        .single()

      if (error) throw error
      setLichDanhGia(data)
    } catch (error) {
      console.error('Lỗi khi tải thông tin lịch đánh giá:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin lịch đánh giá",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch đánh giá này?')) return

    try {
      const { error } = await supabase
        .from('lich_danh_gia')
        .delete()
        .eq('id', lichDanhGiaId)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã xóa lịch đánh giá thành công",
      })

      window.location.href = '/lich-danh-gia'
    } catch (error) {
      console.error('Lỗi khi xóa lịch đánh giá:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa lịch đánh giá",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ke_hoach': return <Clock className="h-5 w-5" />
      case 'dang_thuc_hien': return <AlertTriangle className="h-5 w-5" />
      case 'hoan_thanh': return <CheckCircle className="h-5 w-5" />
      case 'huy_bo': return <XCircle className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'ke_hoach': return 'from-blue-600 via-blue-700 to-indigo-800'
      case 'dang_thuc_hien': return 'from-yellow-600 via-yellow-700 to-orange-800'
      case 'hoan_thanh': return 'from-green-600 via-green-700 to-emerald-800'
      case 'huy_bo': return 'from-red-600 via-red-700 to-rose-800'
      default: return 'from-gray-600 via-gray-700 to-slate-800'
    }
  }

  const calculateDuration = () => {
    if (!lichDanhGia?.ngay_bat_dau_thuc_te || !lichDanhGia?.ngay_ket_thuc_thuc_te) {
      return null
    }
    
    const startDate = new Date(lichDanhGia.ngay_bat_dau_thuc_te)
    const endDate = new Date(lichDanhGia.ngay_ket_thuc_thuc_te)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 để bao gồm cả ngày bắt đầu
    
    return diffDays
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p>Đang tải dữ liệu...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!lichDanhGia) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p>Không tìm thấy lịch đánh giá</p>
          <Link href="/lich-danh-gia">
            <Button className="mt-4">Quay lại danh sách</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const duration = calculateDuration()

  return (
    <DashboardLayout>
      {/* Header với gradient background */}
      <div className={`relative bg-gradient-to-r ${getStatusTheme(lichDanhGia.trang_thai)} rounded-xl p-6 mb-8 text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/lich-danh-gia">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{lichDanhGia.tieu_chuan?.ten_tieu_chuan}</h1>
                  <p className="text-blue-100 text-sm">Lịch đánh giá</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className={`${trangThaiColors[lichDanhGia.trang_thai]} border-0 text-sm px-3 py-1`}
              >
                {getStatusIcon(lichDanhGia.trang_thai)}
                <span className="ml-1">{trangThaiLabels[lichDanhGia.trang_thai]}</span>
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-lg font-medium">{formatDate(lichDanhGia.ngay_du_kien)}</p>
              <p className="text-blue-100 text-sm">Ngày dự kiến</p>
            </div>
            <div>
              <p className="text-lg font-medium">{lichDanhGia.auditor || 'Chưa xác định'}</p>
              <p className="text-blue-100 text-sm">Auditor</p>
            </div>
            <div>
              <p className="text-lg font-medium">{lichDanhGia.to_chuc_danh_gia || 'Chưa xác định'}</p>
              <p className="text-blue-100 text-sm">Tổ chức đánh giá</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          {duration && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Thời gian thực hiện: {duration} ngày</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/lich-danh-gia/${lichDanhGiaId}/chinh-sua`}>
            <Button 
              variant="outline"
              className="h-9 px-3 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="h-9 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Thông tin chi tiết */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Tiêu chuẩn</h4>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-700">{lichDanhGia.tieu_chuan?.ten_tieu_chuan}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Ngày dự kiến</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">{formatDate(lichDanhGia.ngay_du_kien)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Trạng thái</h4>
                    <Badge className={trangThaiColors[lichDanhGia.trang_thai]}>
                      {getStatusIcon(lichDanhGia.trang_thai)}
                      <span className="ml-1">{trangThaiLabels[lichDanhGia.trang_thai]}</span>
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Auditor</h4>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">{lichDanhGia.auditor || 'Chưa xác định'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Tổ chức đánh giá</h4>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">{lichDanhGia.to_chuc_danh_gia || 'Chưa xác định'}</span>
                    </div>
                  </div>

                  {duration && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Thời gian thực hiện</h4>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">{duration} ngày</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {lichDanhGia.ghi_chu && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Ghi chú</h4>
                  <p className="text-gray-700">{lichDanhGia.ghi_chu}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thời gian thực hiện */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thời gian thực hiện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Ngày dự kiến</span>
                <span className="font-semibold text-blue-600">{formatDate(lichDanhGia.ngay_du_kien)}</span>
              </div>
              
              {lichDanhGia.ngay_bat_dau_thuc_te && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">Bắt đầu thực tế</span>
                  <span className="font-semibold text-green-600">{formatDate(lichDanhGia.ngay_bat_dau_thuc_te)}</span>
                </div>
              )}
              
              {lichDanhGia.ngay_ket_thuc_thuc_te && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-700">Kết thúc thực tế</span>
                  <span className="font-semibold text-purple-600">{formatDate(lichDanhGia.ngay_ket_thuc_thuc_te)}</span>
                </div>
              )}

              {!lichDanhGia.ngay_bat_dau_thuc_te && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Chưa bắt đầu thực hiện
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thông tin hệ thống */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Thông tin hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Ngày tạo</span>
                <span className="font-medium">{formatDate(lichDanhGia.created_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cập nhật lần cuối</span>
                <span className="font-medium">{formatDate(lichDanhGia.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}