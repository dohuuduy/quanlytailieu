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
  FileText, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
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
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
  ngay_het_hieu_luc: string | null
}

export default function ChiTietTieuChuanPage() {
  const [tieuChuan, setTieuChuan] = useState<TieuChuan | null>(null)
  const [hoSoList, setHoSoList] = useState<HoSo[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()
  const params = useParams()
  const supabase = createSupabaseClient()
  const tieuChuanId = params.id as string

  // Calculate statistics directly from hoSoList
  const totalDocs = hoSoList.length
  const hieuLucDocs = hoSoList.filter(doc => doc.tinh_trang === 'hieu_luc').length
  const choDuyetDocs = hoSoList.filter(doc => doc.tinh_trang === 'cho_duyet').length
  
  // Calculate expiring documents
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
  const expiringDocs = hoSoList.filter(doc => {
    if (!doc.ngay_het_hieu_luc || doc.tinh_trang !== 'hieu_luc') return false
    const expiryDate = new Date(doc.ngay_het_hieu_luc)
    return expiryDate >= today && expiryDate <= thirtyDaysFromNow
  }).length

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
            tinh_trang,
            ngay_het_hieu_luc
          )
        `)
        .eq('tieu_chuan_id', tieuChuanId)

      if (error) throw error

      const documents = data
        ?.map((item: any) => item.ho_so)
        .filter((doc: any) => doc !== null) as HoSo[]

      console.log('✅ Documents loaded:', documents)
      console.log('✅ Statistics:', {
        total: documents?.length || 0,
        hieu_luc: documents?.filter(d => d.tinh_trang === 'hieu_luc').length || 0,
        cho_duyet: documents?.filter(d => d.tinh_trang === 'cho_duyet').length || 0
      })

      setHoSoList(documents || [])
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ liên quan:', error)
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
            <Button className="mt-4">Quay lại danh sách</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center gap-4">
          <Link href="/danh-muc/tieu-chuan">
            <Button variant="secondary" size="sm" className="bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">{tieuChuan.ten_tieu_chuan}</h1>
              <p className="text-blue-100">Tiêu chuẩn áp dụng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu áp dụng tiêu chuẩn này</CardTitle>
            </CardHeader>
            <CardContent>
              {hoSoList.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Chưa có tài liệu nào áp dụng tiêu chuẩn này
                </p>
              ) : (
                <div className="space-y-4">
                  {hoSoList.map((hoSo) => (
                    <div key={hoSo.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{hoSo.ten_tai_lieu}</h4>
                      <p className="text-sm text-gray-600">
                        Mã: {hoSo.ma_tai_lieu} | Trạng thái: {hoSo.tinh_trang}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Statistics */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Thống kê
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tổng tài liệu */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Tổng tài liệu</span>
                </div>
                <span className="font-semibold text-blue-600 text-xl">
                  {totalDocs}
                </span>
              </div>

              {/* Đang hiệu lực */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Đang hiệu lực</span>
                </div>
                <span className="font-semibold text-green-600 text-xl">
                  {hieuLucDocs}
                </span>
              </div>

              {/* Chờ phê duyệt */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Chờ phê duyệt</span>
                </div>
                <span className="font-semibold text-yellow-600 text-xl">
                  {choDuyetDocs}
                </span>
              </div>

              {/* Sắp hết hạn */}
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Sắp hết hạn</span>
                </div>
                <span className="font-semibold text-orange-600 text-xl">
                  {expiringDocs}
                </span>
              </div>

              {/* Debug Info */}
              <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs">
                <div className="font-medium mb-2">🔧 Debug Info:</div>
                <div>ID: {tieuChuanId}</div>
                <div>Loaded: {hoSoList.length} docs</div>
                <div>Raw data: {JSON.stringify(hoSoList.map(d => ({
                  ma: d.ma_tai_lieu,
                  status: d.tinh_trang
                })))}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}