'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ArrowLeft, Edit, Trash2, User, FileText } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface NguoiDung {
  id: string
  ho_ten: string
  email: string
  vai_tro: 'quan_tri' | 'phe_duyet' | 'nguoi_dung'
  ngay_tao: string
}

interface HoSo {
  id: string
  ma_tai_lieu: string
  ten_tai_lieu: string
  ngay_ban_hanh: string
  tinh_trang: string
}

const vaiTroLabels = {
  quan_tri: 'Quản trị viên',
  phe_duyet: 'Người phê duyệt',
  nguoi_dung: 'Người dùng'
}

const vaiTroColors = {
  quan_tri: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  phe_duyet: 'bg-green-100 text-green-800 hover:bg-green-200',
  nguoi_dung: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
}

export default function ChiTietNguoiDungPage() {
  const [nguoiDung, setNguoiDung] = useState<NguoiDung | null>(null)
  const [hoSoList, setHoSoList] = useState<HoSo[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()
  const params = useParams()
  const supabase = createSupabaseClient()
  const userId = params.id as string

  useEffect(() => {
    if (userId) {
      fetchNguoiDung()
      fetchHoSoLienQuan()
    }
  }, [userId])

  const fetchNguoiDung = async () => {
    try {
      const { data, error } = await supabase
        .from('nguoi_dung')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setNguoiDung(data)
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng",
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
        .select('id, ma_tai_lieu, ten_tai_lieu, ngay_ban_hanh, tinh_trang')
        .eq('nguoi_ban_hanh_id', userId)
        .order('ngay_ban_hanh', { ascending: false })
        .limit(5)

      if (error) throw error
      setHoSoList(data || [])
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ liên quan:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return

    try {
      const { error } = await supabase
        .from('nguoi_dung')
        .delete()
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công",
      })

      // Redirect về trang danh sách
      window.location.href = '/nguoi-dung'
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng. Người dùng có thể đang được tham chiếu trong hồ sơ.",
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

  if (!nguoiDung) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p>Không tìm thấy người dùng</p>
          <Link href="/nguoi-dung">
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
          <Link href="/nguoi-dung">
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
            <h1 className="text-3xl font-bold text-gray-900">{nguoiDung.ho_ten}</h1>
            <p className="text-gray-600 mt-1">{nguoiDung.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/nguoi-dung/${userId}/chinh-sua`}>
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
                  <User className="h-5 w-5" />
                  Thông tin Người dùng
                </CardTitle>
                <Badge className={vaiTroColors[nguoiDung.vai_tro]}>
                  {vaiTroLabels[nguoiDung.vai_tro]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Họ tên</h4>
                  <p className="text-gray-600">{nguoiDung.ho_ten}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <p className="text-gray-600">{nguoiDung.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Vai trò</h4>
                  <p className="text-gray-600">{vaiTroLabels[nguoiDung.vai_tro]}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Ngày tạo</h4>
                  <p className="text-gray-600">{formatDateTime(nguoiDung.ngay_tao)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hồ sơ liên quan */}
          {hoSoList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Hồ sơ đã ban hành
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mã tài liệu</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tên tài liệu</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ngày ban hành</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hoSoList.map((hoSo) => (
                        <tr key={hoSo.id} className="border-t hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{hoSo.ma_tai_lieu}</td>
                          <td className="px-4 py-3">{hoSo.ten_tai_lieu}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDateTime(hoSo.ngay_ban_hanh)}</td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/ho-so/${hoSo.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                Xem
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hoSoList.length > 0 && (
                  <div className="mt-4 text-right">
                    <Link href="/ho-so">
                      <Button variant="link" size="sm">
                        Xem tất cả hồ sơ
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thông tin bổ sung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Số hồ sơ đã ban hành</h4>
                  <p className="text-gray-600">{hoSoList.length}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Trạng thái</h4>
                  <p className="text-green-600">Đang hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}