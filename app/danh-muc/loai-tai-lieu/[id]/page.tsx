'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDateTime, formatDate } from '@/lib/utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Tag, 
  Calendar, 
  Activity, 
  Eye, 
  Copy, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Folder
} from 'lucide-react'
import Link from 'next/link'

interface LoaiTaiLieu {
  id: string
  ten_loai: string
  mo_ta: string | null
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
}

interface HoSo {
  id: string
  ma_tai_lieu: string
  ten_tai_lieu: string
  phien_ban: string
  ngay_ban_hanh: string
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
  nguoi_ban_hanh: {
    ho_ten: string
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

export default function ChiTietLoaiTaiLieuPage() {
  const [loaiTaiLieu, setLoaiTaiLieu] = useState<LoaiTaiLieu | null>(null)
  const [hoSoList, setHoSoList] = useState<HoSo[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()
  const params = useParams()
  const supabase = createSupabaseClient()
  const loaiTaiLieuId = params.id as string

  useEffect(() => {
    if (loaiTaiLieuId) {
      fetchLoaiTaiLieu()
      fetchHoSoLienQuan()
    }
  }, [loaiTaiLieuId])

  const fetchLoaiTaiLieu = async () => {
    try {
      const { data, error } = await supabase
        .from('loai_tai_lieu')
        .select('*')
        .eq('id', loaiTaiLieuId)
        .single()

      if (error) throw error
      setLoaiTaiLieu(data)
    } catch (error) {
      console.error('Lỗi khi tải thông tin loại tài liệu:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin loại tài liệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchHoSoLienQuan = async () => {
    try {
      const { data, error } = await supabase
        .from('ho_so')
        .select(`
          id, 
          ma_tai_lieu, 
          ten_tai_lieu, 
          phien_ban, 
          ngay_ban_hanh, 
          tinh_trang,
          nguoi_ban_hanh:nguoi_dung!nguoi_ban_hanh_id(ho_ten)
        `)
        .eq('loai_tai_lieu_id', loaiTaiLieuId)
        .order('ngay_ban_hanh', { ascending: false })
        .limit(10)

      if (error) throw error
      setHoSoList(data || [])
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ liên quan:', error)
    }
  }

  const handleDelete = async () => {
    if (hoSoList.length > 0) {
      toast({
        title: "Không thể xóa",
        description: `Loại tài liệu này đang được sử dụng trong ${hoSoList.length} hồ sơ.`,
        variant: "destructive",
      })
      return
    }

    if (!confirm('Bạn có chắc chắn muốn xóa loại tài liệu này?')) return

    try {
      const { error } = await supabase
        .from('loai_tai_lieu')
        .delete()
        .eq('id', loaiTaiLieuId)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã xóa loại tài liệu thành công",
      })

      window.location.href = '/danh-muc/loai-tai-lieu'
    } catch (error) {
      console.error('Lỗi khi xóa loại tài liệu:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa loại tài liệu",
        variant: "destructive",
      })
    }
  }

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã sao chép",
        description: "Thông tin đã được sao chép vào clipboard",
      })
    })
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hieu_luc': return <CheckCircle className="h-5 w-5" />
      case 'cho_duyet': return <Clock className="h-5 w-5" />
      case 'het_hieu_luc': return <XCircle className="h-5 w-5" />
      default: return <AlertCircle className="h-5 w-5" />
    }
  }

  // Get status theme
  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'hieu_luc': return 'from-green-600 via-green-700 to-emerald-800'
      case 'cho_duyet': return 'from-yellow-600 via-yellow-700 to-orange-800'
      case 'het_hieu_luc': return 'from-red-600 via-red-700 to-rose-800'
      default: return 'from-gray-600 via-gray-700 to-slate-800'
    }
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

  if (!loaiTaiLieu) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p>Không tìm thấy loại tài liệu</p>
          <Link href="/danh-muc/loai-tai-lieu">
            <Button className="mt-4 h-10 px-4 font-medium">Quay lại danh sách</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header với gradient background */}
      <div className={`relative bg-gradient-to-r ${getStatusTheme(loaiTaiLieu.tinh_trang)} rounded-xl p-6 mb-8 text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/danh-muc/loai-tai-lieu">
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
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{loaiTaiLieu.ten_loai}</h1>
                  <p className="text-blue-100 text-sm">Loại tài liệu</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className={`${tinhTrangColors[loaiTaiLieu.tinh_trang]} border-0 text-sm px-3 py-1`}
              >
                {getStatusIcon(loaiTaiLieu.tinh_trang)}
                <span className="ml-1">{tinhTrangLabels[loaiTaiLieu.tinh_trang]}</span>
              </Badge>
              
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 text-sm px-3 py-1"
              >
                <FileText className="h-4 w-4 mr-1" />
                {hoSoList.length} tài liệu
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-lg font-medium">{loaiTaiLieu.mo_ta || 'Không có mô tả'}</p>
              <p className="text-blue-100 text-sm">Mô tả loại tài liệu</p>
            </div>
            <div>
              <p className="text-lg font-medium">{hoSoList.length} tài liệu</p>
              <p className="text-blue-100 text-sm">Đang sử dụng</p>
            </div>
            <div>
              <p className="text-lg font-medium">{tinhTrangLabels[loaiTaiLieu.tinh_trang]}</p>
              <p className="text-blue-100 text-sm">Trạng thái hiện tại</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(loaiTaiLieu.ten_loai)}
            className="h-9 px-3 text-sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Sao chép tên
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/danh-muc/loai-tai-lieu/${loaiTaiLieuId}/chinh-sua`}>
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
            disabled={hoSoList.length > 0}
            className="h-9 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
            title={hoSoList.length > 0 ? 'Không thể xóa vì đang được sử dụng' : 'Xóa loại tài liệu'}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Category Information */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Info className="h-5 w-5 text-blue-600" />
                Thông tin chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Tag className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Tên loại tài liệu</h4>
                      <p className="text-gray-700 font-medium">{loaiTaiLieu.ten_loai}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Tình trạng</h4>
                      <Badge variant="outline" className={`${tinhTrangColors[loaiTaiLieu.tinh_trang]} border-green-300`}>
                        {getStatusIcon(loaiTaiLieu.tinh_trang)}
                        <span className="ml-1">{tinhTrangLabels[loaiTaiLieu.tinh_trang]}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Số tài liệu sử dụng</h4>
                      <p className="text-gray-700 font-semibold text-lg">{hoSoList.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {loaiTaiLieu.mo_ta && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    Mô tả
                  </h4>
                  <p className="text-gray-700">{loaiTaiLieu.mo_ta}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Using This Category */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-blue-600" />
                Tài liệu sử dụng loại này
                <Badge variant="secondary" className="ml-2">
                  {hoSoList.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {hoSoList.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">Chưa có tài liệu nào sử dụng loại này</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hoSoList.map((hoSo) => (
                    <div key={hoSo.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm truncate">{hoSo.ten_tai_lieu}</h4>
                          <Badge variant="outline" className="text-xs">
                            {hoSo.ma_tai_lieu}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            v{hoSo.phien_ban}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(hoSo.ngay_ban_hanh)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {hoSo.nguoi_ban_hanh?.ho_ten}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${tinhTrangColors[hoSo.tinh_trang]}`}
                          >
                            {tinhTrangLabels[hoSo.tinh_trang]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/ho-so/${hoSo.id}`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4 border-t">
                    <Link href={`/ho-so?loai_tai_lieu=${loaiTaiLieuId}`}>
                      <Button variant="outline" size="sm">
                        Xem tất cả tài liệu loại này
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Thống kê
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Tổng tài liệu</span>
                  </div>
                  <span className="font-semibold text-blue-600">{hoSoList.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Hiệu lực</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {hoSoList.filter(h => h.tinh_trang === 'hieu_luc').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-gray-700">Chờ duyệt</span>
                  </div>
                  <span className="font-semibold text-yellow-600">
                    {hoSoList.filter(h => h.tinh_trang === 'cho_duyet').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Status */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Activity className="h-5 w-5 text-gray-600" />
                Trạng thái loại
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(loaiTaiLieu.tinh_trang)}
                  <div>
                    <p className="text-sm text-gray-600">Tình trạng hiện tại</p>
                    <p className="font-medium text-gray-900">{tinhTrangLabels[loaiTaiLieu.tinh_trang]}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Khả năng xóa</p>
                    <p className="font-medium text-gray-900">
                      {hoSoList.length > 0 ? 'Không thể xóa' : 'Có thể xóa'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}