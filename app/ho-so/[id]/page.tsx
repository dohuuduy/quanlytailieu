'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate, formatDateTime } from '@/lib/utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ArrowLeft, Edit, Trash2, History, FileText } from 'lucide-react'
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/ho-so">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 font-medium hover:bg-accent/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hoSo.ma_tai_lieu}</h1>
            <p className="text-gray-600 mt-1">{hoSo.ten_tai_lieu}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="h-10 px-4 font-medium hover:bg-accent/80 transition-colors"
          >
            <History className="h-4 w-4 mr-2" />
            Lịch sử
          </Button>
          <Link href={`/ho-so/${hoSoId}/chinh-sua`}>
            <Button 
              variant="outline"
              className="h-10 px-4 font-medium hover:bg-accent/80 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="h-10 px-4 font-medium text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin chính */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin Tài liệu
                </CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${tinhTrangColors[hoSo.tinh_trang]}`}>
                  {tinhTrangLabels[hoSo.tinh_trang]}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Mã tài liệu</h4>
                  <p className="text-gray-600">{hoSo.ma_tai_lieu}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Phiên bản</h4>
                  <p className="text-gray-600">{hoSo.phien_ban}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Ngày ban hành</h4>
                  <p className="text-gray-600">{formatDate(hoSo.ngay_ban_hanh)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Ngày hết hiệu lực</h4>
                  <p className="text-gray-600">
                    {hoSo.ngay_het_hieu_luc ? formatDate(hoSo.ngay_het_hieu_luc) : 'Không có'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Loại tài liệu</h4>
                  <p className="text-gray-600">{hoSo.loai_tai_lieu.ten_loai}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Người ban hành</h4>
                  <p className="text-gray-600">{hoSo.nguoi_ban_hanh.ho_ten}</p>
                  <p className="text-sm text-gray-500">{hoSo.nguoi_ban_hanh.email}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Tên tài liệu</h4>
                <p className="text-gray-600">{hoSo.ten_tai_lieu}</p>
              </div>

              {hoSo.ghi_chu && (
                <div>
                  <h4 className="font-medium text-gray-900">Ghi chú</h4>
                  <p className="text-gray-600">{hoSo.ghi_chu}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tiêu chuẩn áp dụng */}
          {hoSo.tai_lieu_tieu_chuan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tiêu chuẩn áp dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hoSo.tai_lieu_tieu_chuan.map((item, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-900">{item.tieu_chuan.ten_tieu_chuan}</h5>
                      {item.tieu_chuan.mo_ta && (
                        <p className="text-sm text-blue-700 mt-1">{item.tieu_chuan.mo_ta}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thông tin tạo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin tạo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Ngày tạo</h4>
                  <p className="text-gray-600">{formatDateTime(hoSo.ngay_tao)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lịch sử thay đổi */}
          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lịch sử thay đổi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lichSu.length === 0 ? (
                    <p className="text-gray-500 text-sm">Chưa có lịch sử thay đổi</p>
                  ) : (
                    lichSu.map((item) => (
                      <div key={item.id} className="border-l-2 border-gray-200 pl-4 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {hanhDongLabels[item.hanh_dong]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(item.ngay_thuc_hien)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Bởi: {item.nguoi_thuc_hien.ho_ten}
                        </p>
                        {item.ghi_chu && (
                          <p className="text-sm text-gray-500 mt-1">{item.ghi_chu}</p>
                        )}
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