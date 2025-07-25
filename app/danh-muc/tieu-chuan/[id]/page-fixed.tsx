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
  FileText, 
  BookOpen, 
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
  Shield,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface TieuChuan {
  id: string
  ten_tieu_chuan: string
  mo_ta: string | null
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
}

interface HoSo {
  id: string
  ma_tai_lieu: string
  ten_tai_lieu: string
  phien_ban: string
  ngay_ban_hanh: string
  ngay_het_hieu_luc: string | null
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

export default function ChiTietTieuChuanPage() {
  const [tieuChuan, setTieuChuan] = useState<TieuChuan | null>(null)
  const [hoSoList, setHoSoList] = useState<HoSo[]>([])
  const [statistics, setStatistics] = useState({
    total: 0,
    hieu_luc: 0,
    cho_duyet: 0,
    expiring: 0
  })
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()
  const params = useParams()
  const supabase = createSupabaseClient()
  const tieuChuanId = params.id as string

  useEffect(() => {
    if (tieuChuanId) {
      fetchTieuChuan()
      fetchHoSoLienQuan()
    }
  }, [tieuChuanId])

  const fetchTieuChuan = async () => {
    try {
      const { data, error } = await supabase
        .from('tieu_chuan')
        .select('*')
        .eq('id', tieuChuanId)
        .single()

      if (error) throw error
      setTieuChuan(data)
    } catch (error) {
      console.error('Lỗi khi tải thông tin tiêu chuẩn:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin tiêu chuẩn",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchHoSoLienQuan = async () => {
    try {
      const { data, error } = await supabase
        .from('tai_lieu_tieu_chuan')
        .select(`
          ho_so:ho_so_id (
            id,
            ma_tai_lieu,
            ten_tai_lieu,
            phien_ban,
            ngay_ban_hanh,
            ngay_het_hieu_luc,
            tinh_trang,
            nguoi_ban_hanh:nguoi_dung!nguoi_ban_hanh_id(ho_ten),
            loai_tai_lieu(ten_loai)
          )
        `)
        .eq('tieu_chuan_id', tieuChuanId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Flatten dữ liệu và lọc ra các hồ sơ hợp lệ
      const documents = data
        ?.map((item: any) => item.ho_so)
        .filter((doc: any) => doc !== null) as HoSo[]

      console.log('Documents loaded:', documents)
      setHoSoList(documents || [])
      
      // Calculate statistics
      calculateStatistics(documents || [])
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ liên quan:', error)
    }
  }

  const calculateStatistics = (documents: HoSo[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    const stats = {
      total: documents.length,
      hieu_luc: documents.filter(doc => doc.tinh_trang === 'hieu_luc').length,
      cho_duyet: documents.filter(doc => doc.tinh_trang === 'cho_duyet').length,
      expiring: documents.filter(doc => {
        if (!doc.ngay_het_hieu_luc || doc.tinh_trang !== 'hieu_luc') return false
        const expiryDate = new Date(doc.ngay_het_hieu_luc)
        expiryDate.setHours(0, 0, 0, 0)
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow
      }).length
    }
    
    console.log('Statistics calculated:', stats)
    setStatistics(stats)
  }

  const handleDelete = async () => {
    if (hoSoList.length > 0) {
      toast({
        title: "Không thể xóa",
        description: `Tiêu chuẩn này đang được sử dụng trong ${hoSoList.length} tài liệu.`,
        variant: "destructive",
      })
      return
    }

    if (!confirm('Bạn có chắc chắn muốn xóa tiêu chuẩn này?')) return

    try {
      const { error } = await supabase
        .from('tieu_chuan')
        .delete()
        .eq('id', tieuChuanId)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã xóa tiêu chuẩn thành công",
      })

      window.location.href = '/danh-muc/tieu-chuan'
    } catch (error) {
      console.error('Lỗi khi xóa tiêu chuẩn:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa tiêu chuẩn",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã sao chép",
        description: "Thông tin đã được sao chép vào clipboard",
      })
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hieu_luc': return <CheckCircle className="h-5 w-5" />
      case 'cho_duyet': return <Clock className="h-5 w-5" />
      case 'het_hieu_luc': return <XCircle className="h-5 w-5" />
      default: return <AlertCircle className="h-5 w-5" />
    }
  }

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'hieu_luc': return 'from-blue-600 via-blue-700 to-indigo-800'
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

  if (!tieuChuan) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p>Không tìm thấy tiêu chuẩn</p>
          <Link href="/danh-muc/tieu-chuan">
            <Button className="mt-4 h-10 px-4 font-medium">Quay lại danh sách</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header với gradient background */}
      <div className={`relative bg-gradient-to-r ${getStatusTheme(tieuChuan.tinh_trang)} rounded-xl p-6 mb-8 text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/danh-muc/tieu-chuan">
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
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{tieuChuan.ten_tieu_chuan}</h1>
                  <p className="text-blue-100 text-sm">Tiêu chuẩn áp dụng</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className={`${tinhTrangColors[tieuChuan.tinh_trang]} border-0 text-sm px-3 py-1`}
              >
                {getStatusIcon(tieuChuan.tinh_trang)}
                <span className="ml-1">{tinhTrangLabels[tieuChuan.tinh_trang]}</span>
              </Badge>
              
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 text-sm px-3 py-1"
              >
                <FileText className="h-4 w-4 mr-1" />
                {statistics.total} tài liệu
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-lg font-medium">{tieuChuan.mo_ta || 'Không có mô tả'}</p>
              <p className="text-blue-100 text-sm">Mô tả tiêu chuẩn</p>
            </div>
            <div>
              <p className="text-lg font-medium">{statistics.total} tài liệu</p>
              <p className="text-blue-100 text-sm">Áp dụng tiêu chuẩn này</p>
            </div>
            <div>
              <p className="text-lg font-medium">{tinhTrangLabels[tieuChuan.tinh_trang]}</p>
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
            onClick={() => copyToClipboard(tieuChuan.ten_tieu_chuan)}
            className="h-9 px-3 text-sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Sao chép tên
          </Button>
          
          <Link href={`/tra-cuu/tieu-chuan?standard=${tieuChuanId}`}>
            <Button
              variant="outline"
              className="h-9 px-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Tra cứu tài liệu
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/danh-muc/tieu-chuan/${tieuChuanId}/chinh-sua`}>
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
            title={hoSoList.length > 0 ? 'Không thể xóa vì đang được sử dụng' : 'Xóa tiêu chuẩn'}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Documents Using This Standard */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-blue-600" />
                Tài liệu áp dụng tiêu chuẩn này
                <Badge variant="secondary" className="ml-2">
                  {statistics.total}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {hoSoList.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">Chưa có tài liệu nào áp dụng tiêu chuẩn này</p>
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
                          <Badge variant="secondary" className="text-xs">
                            {hoSo.loai_tai_lieu?.ten_loai}
                          </Badge>
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
                  <span className="font-semibold text-blue-600">{statistics.total}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Đang hiệu lực</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {statistics.hieu_luc}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-gray-700">Chờ phê duyệt</span>
                  </div>
                  <span className="font-semibold text-yellow-600">
                    {statistics.cho_duyet}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-700">Sắp hết hạn</span>
                  </div>
                  <span className="font-semibold text-orange-600">
                    {statistics.expiring}
                  </span>
                </div>
              </div>
              
              {/* Debug info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
                <div className="font-medium mb-2">🔧 Debug Info:</div>
                <div>Tiêu chuẩn ID: {tieuChuanId}</div>
                <div>Tài liệu loaded: {hoSoList.length}</div>
                <div>Hiệu lực: {hoSoList.filter(d => d.tinh_trang === 'hieu_luc').length}</div>
                <div>Chờ duyệt: {hoSoList.filter(d => d.tinh_trang === 'cho_duyet').length}</div>
                <div>Có ngày hết hạn: {hoSoList.filter(d => d.ngay_het_hieu_luc).length}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}