'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate, formatDateTime } from '@/lib/utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  History, 
  FileText, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Eye,
  Share2,
  Copy,
  MoreVertical,
  Activity,
  Shield,
  Info
} from 'lucide-react'
import Link from 'next/link'

interface HoSoDetail {
  id: string
  ma_tai_lieu: string
  ten_tai_lieu: string
  phien_ban: string
  ngay_ban_hanh: string
  ngay_het_hieu_luc: string | null
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
  ghi_chu: string | null
  link_tai_lieu: string | null
  ngay_tao: string
  nguoi_ban_hanh: {
    ho_ten: string
    email: string
  }
  loai_tai_lieu: {
    ten_loai: string
    mo_ta: string | null
  }
  tai_lieu_tieu_chuan: Array<{
    tieu_chuan: {
      ten_tieu_chuan: string
      mo_ta: string | null
    }
  }>
}

interface LichSu {
  id: string
  hanh_dong: 'tao_moi' | 'cap_nhat' | 'phe_duyet' | 'huy_bo'
  ngay_thuc_hien: string
  ghi_chu: string | null
  nguoi_thuc_hien: {
    ho_ten: string
  }
}

const tinhTrangColors = {
  hieu_luc: 'bg-green-100 text-green-800 border-green-200',
  cho_duyet: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  het_hieu_luc: 'bg-red-100 text-red-800 border-red-200'
}

const tinhTrangLabels = {
  hieu_luc: 'Hiệu lực',
  cho_duyet: 'Chờ duyệt',
  het_hieu_luc: 'Hết hiệu lực'
}

const hanhDongLabels = {
  tao_moi: 'Tạo mới',
  cap_nhat: 'Cập nhật',
  phe_duyet: 'Phê duyệt',
  huy_bo: 'Hủy bỏ'
}

export default function ChiTietHoSoPage() {
  const [hoSo, setHoSo] = useState<HoSoDetail | null>(null)
  const [lichSu, setLichSu] = useState<LichSu[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const { toast } = useToast()
  const params = useParams()
  const supabase = createSupabaseClient()
  const hoSoId = params.id as string

  useEffect(() => {
    if (hoSoId) {
      fetchHoSoDetail()
      fetchLichSu()
    }
  }, [hoSoId])

  const fetchHoSoDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('ho_so')
        .select(`
          *,
          nguoi_ban_hanh:nguoi_dung!nguoi_ban_hanh_id(ho_ten, email),
          loai_tai_lieu(ten_loai, mo_ta),
          tai_lieu_tieu_chuan(
            tieu_chuan(ten_tieu_chuan, mo_ta)
          )
        `)
        .eq('id', hoSoId)
        .single()

      if (error) throw error
      setHoSo(data)
    } catch (error) {
      console.error('Lỗi khi tải chi tiết hồ sơ:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin hồ sơ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchLichSu = async () => {
    try {
      const { data, error } = await supabase
        .from('lich_su_ho_so')
        .select(`
          *,
          nguoi_thuc_hien:nguoi_dung!nguoi_thuc_hien_id(ho_ten)
        `)
        .eq('ho_so_id', hoSoId)
        .order('ngay_thuc_hien', { ascending: false })

      if (error) throw error
      setLichSu(data || [])
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) return

    try {
      const { error } = await supabase
        .from('ho_so')
        .delete()
        .eq('id', hoSoId)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã xóa hồ sơ thành công",
      })

      // Redirect về trang danh sách
      window.location.href = '/ho-so'
    } catch (error) {
      console.error('Lỗi khi xóa hồ sơ:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa hồ sơ",
        variant: "destructive",
      })
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

  if (!hoSo) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p>Không tìm thấy hồ sơ</p>
          <Link href="/ho-so">
            <Button className="mt-4 h-10 px-4 font-medium">Quay lại danh sách</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  // Tính toán thời gian hết hạn
  const getExpiryStatus = () => {
    if (!hoSo.ngay_het_hieu_luc) return null
    
    const today = new Date()
    const expiryDate = new Date(hoSo.ngay_het_hieu_luc)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'expired', days: Math.abs(diffDays), color: 'text-red-600' }
    if (diffDays <= 7) return { status: 'critical', days: diffDays, color: 'text-red-600' }
    if (diffDays <= 30) return { status: 'warning', days: diffDays, color: 'text-orange-600' }
    return { status: 'normal', days: diffDays, color: 'text-green-600' }
  }

  const expiryStatus = getExpiryStatus()

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã sao chép",
        description: "Thông tin đã được sao chép vào clipboard",
      })
    })
  }

  return (
    <DashboardLayout>
      {/* Header với gradient background */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl p-6 mb-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/ho-so">
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
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{hoSo.ma_tai_lieu}</h1>
                  <p className="text-blue-100 text-sm">Mã tài liệu</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className={`${tinhTrangColors[hoSo.tinh_trang]} border-0 text-sm px-3 py-1`}
              >
                {hoSo.tinh_trang === 'hieu_luc' && <CheckCircle className="h-4 w-4 mr-1" />}
                {hoSo.tinh_trang === 'cho_duyet' && <Clock className="h-4 w-4 mr-1" />}
                {hoSo.tinh_trang === 'het_hieu_luc' && <XCircle className="h-4 w-4 mr-1" />}
                {tinhTrangLabels[hoSo.tinh_trang]}
              </Badge>
              
              {expiryStatus && (
                <Badge 
                  variant="secondary" 
                  className={`bg-white/20 text-white border-white/30 text-sm px-3 py-1`}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {expiryStatus.status === 'expired' 
                    ? `Đã hết hạn ${expiryStatus.days} ngày`
                    : `Còn ${expiryStatus.days} ngày`
                  }
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{hoSo.ten_tai_lieu}</h2>
              <p className="text-blue-100 text-sm">Tên tài liệu</p>
            </div>
            <div>
              <p className="text-lg font-medium">Phiên bản {hoSo.phien_ban}</p>
              <p className="text-blue-100 text-sm">Phiên bản hiện tại</p>
            </div>
            <div>
              <p className="text-lg font-medium">{hoSo.loai_tai_lieu.ten_loai}</p>
              <p className="text-blue-100 text-sm">Loại tài liệu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(hoSo.ma_tai_lieu)}
            className="h-9 px-3 text-sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Sao chép mã
          </Button>
          
          {hoSo.link_tai_lieu && (
            <>
              <Button
                variant="outline"
                onClick={() => window.open(hoSo.link_tai_lieu!, '_blank')}
                className="h-9 px-3 text-sm text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Mở file
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const previewWindow = window.open('', '_blank', 'width=900,height=700');
                  if (previewWindow) {
                    previewWindow.document.write(`
                      <html>
                        <head>
                          <title>Preview: ${hoSo.ten_tai_lieu}</title>
                          <style>
                            body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                            .header { background: #f8fafc; padding: 16px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                            .preview-container { width: 100%; height: calc(100vh - 120px); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
                            iframe { width: 100%; height: 100%; border: none; }
                            h3 { margin: 0 0 8px 0; color: #1e293b; }
                            p { margin: 0; color: #64748b; font-size: 14px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h3>${hoSo.ten_tai_lieu} (${hoSo.phien_ban})</h3>
                            <p>Mã tài liệu: ${hoSo.ma_tai_lieu} • Người ban hành: ${hoSo.nguoi_ban_hanh.ho_ten}</p>
                          </div>
                          <div class="preview-container">
                            <iframe src="${hoSo.link_tai_lieu}" title="Document Preview"></iframe>
                          </div>
                        </body>
                      </html>
                    `);
                  }
                }}
                className="h-9 px-3 text-sm text-green-600 hover:text-green-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem trước
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className={`h-9 px-3 text-sm ${showHistory ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
          >
            <History className="h-4 w-4 mr-2" />
            Lịch sử
          </Button>
          <Link href={`/ho-so/${hoSoId}/chinh-sua`}>
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Document Information */}
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
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Mã tài liệu</h4>
                      <p className="text-gray-700 font-mono text-sm">{hoSo.ma_tai_lieu}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Tag className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Phiên bản</h4>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        {hoSo.phien_ban}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Tag className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Loại tài liệu</h4>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        {hoSo.loai_tai_lieu.ten_loai}
                      </Badge>
                      {hoSo.loai_tai_lieu.mo_ta && (
                        <p className="text-sm text-gray-600 mt-1">{hoSo.loai_tai_lieu.mo_ta}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Ngày ban hành</h4>
                      <p className="text-gray-700">{formatDate(hoSo.ngay_ban_hanh)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Ngày hết hiệu lực</h4>
                      {hoSo.ngay_het_hieu_luc ? (
                        <div>
                          <p className="text-gray-700">{formatDate(hoSo.ngay_het_hieu_luc)}</p>
                          {expiryStatus && (
                            <p className={`text-sm mt-1 font-medium ${expiryStatus.color}`}>
                              {expiryStatus.status === 'expired' 
                                ? `Đã hết hạn ${expiryStatus.days} ngày`
                                : `Còn ${expiryStatus.days} ngày`
                              }
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">Không có thời hạn</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                    <User className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Người ban hành</h4>
                      <p className="text-gray-700 font-medium">{hoSo.nguoi_ban_hanh.ho_ten}</p>
                      <p className="text-sm text-gray-600">{hoSo.nguoi_ban_hanh.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Tên tài liệu
                </h4>
                <p className="text-gray-800 text-lg font-medium">{hoSo.ten_tai_lieu}</p>
              </div>

              {/* Notes */}
              {hoSo.ghi_chu && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-yellow-600" />
                    Ghi chú
                  </h4>
                  <p className="text-gray-700">{hoSo.ghi_chu}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Standards Applied */}
          {hoSo.tai_lieu_tieu_chuan.length > 0 && (
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Tiêu chuẩn áp dụng
                  <Badge variant="secondary" className="ml-2">
                    {hoSo.tai_lieu_tieu_chuan.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hoSo.tai_lieu_tieu_chuan.map((item, index) => (
                    <div key={index} className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-blue-900 group-hover:text-blue-800 transition-colors">
                            {item.tieu_chuan.ten_tieu_chuan}
                          </h5>
                          {item.tieu_chuan.mo_ta && (
                            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                              {item.tieu_chuan.mo_ta}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Clock className="h-5 w-5 text-gray-600" />
                Thông tin tạo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-medium text-gray-900">{formatDateTime(hoSo.ngay_tao)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Actions */}
          {hoSo.link_tai_lieu && (
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Download className="h-5 w-5 text-green-600" />
                  Tệp đính kèm
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => window.open(hoSo.link_tai_lieu!, '_blank')}
                    className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Mở trong tab mới
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const previewWindow = window.open('', '_blank', 'width=900,height=700');
                      if (previewWindow) {
                        previewWindow.document.write(`
                          <html>
                            <head>
                              <title>Preview: ${hoSo.ten_tai_lieu}</title>
                              <style>
                                body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                                .header { background: #f8fafc; padding: 16px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                                .preview-container { width: 100%; height: calc(100vh - 120px); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
                                iframe { width: 100%; height: 100%; border: none; }
                                h3 { margin: 0 0 8px 0; color: #1e293b; }
                                p { margin: 0; color: #64748b; font-size: 14px; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <h3>${hoSo.ten_tai_lieu} (${hoSo.phien_ban})</h3>
                                <p>Mã tài liệu: ${hoSo.ma_tai_lieu} • Người ban hành: ${hoSo.nguoi_ban_hanh.ho_ten}</p>
                              </div>
                              <div class="preview-container">
                                <iframe src="${hoSo.link_tai_lieu}" title="Document Preview"></iframe>
                              </div>
                            </body>
                          </html>
                        `);
                      }
                    }}
                    className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem trước
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {showHistory && (
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Lịch sử thay đổi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {lichSu.length === 0 ? (
                    <div className="text-center py-6">
                      <Activity className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">Chưa có lịch sử thay đổi</p>
                    </div>
                  ) : (
                    lichSu.map((item, index) => (
                      <div key={item.id} className="relative">
                        {index !== lichSu.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Activity className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {hanhDongLabels[item.hanh_dong]}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(item.ngay_thuc_hien)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">
                              {item.nguoi_thuc_hien.ho_ten}
                            </p>
                            {item.ghi_chu && (
                              <p className="text-xs text-gray-600 mt-1 italic">
                                "{item.ghi_chu}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}