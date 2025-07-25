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
  User, 
  FileText, 
  Mail, 
  Calendar, 
  Shield, 
  Activity, 
  Eye, 
  Copy, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Settings
} from 'lucide-react'
import Link from 'next/link'

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

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã sao chép",
        description: "Thông tin đã được sao chép vào clipboard",
      })
    })
  }

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'quan_tri': return <Settings className="h-5 w-5" />
      case 'phe_duyet': return <CheckCircle className="h-5 w-5" />
      default: return <User className="h-5 w-5" />
    }
  }

  // Get role color theme
  const getRoleTheme = (role: string) => {
    switch (role) {
      case 'quan_tri': return 'from-blue-600 via-blue-700 to-indigo-800'
      case 'phe_duyet': return 'from-green-600 via-green-700 to-emerald-800'
      default: return 'from-gray-600 via-gray-700 to-slate-800'
    }
  }

  return (
    <DashboardLayout>
      {/* Header với gradient background */}
      <div className={`relative bg-gradient-to-r ${getRoleTheme(nguoiDung.vai_tro)} rounded-xl p-6 mb-8 text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/nguoi-dung">
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
                  {getRoleIcon(nguoiDung.vai_tro)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{nguoiDung.ho_ten}</h1>
                  <p className="text-blue-100 text-sm">Người dùng hệ thống</p>
                </div>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className={`${vaiTroColors[nguoiDung.vai_tro]} border-0 text-sm px-3 py-1`}
              >
                {getRoleIcon(nguoiDung.vai_tro)}
                <span className="ml-1">{vaiTroLabels[nguoiDung.vai_tro]}</span>
              </Badge>
              
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 text-sm px-3 py-1"
              >
                <Activity className="h-4 w-4 mr-1" />
                Đang hoạt động
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-lg font-medium">{nguoiDung.email}</p>
              <p className="text-blue-100 text-sm">Địa chỉ email</p>
            </div>
            <div>
              <p className="text-lg font-medium">{hoSoList.length} tài liệu</p>
              <p className="text-blue-100 text-sm">Đã ban hành</p>
            </div>
            <div>
              <p className="text-lg font-medium">{formatDate(nguoiDung.ngay_tao)}</p>
              <p className="text-blue-100 text-sm">Ngày tham gia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(nguoiDung.email)}
            className="h-9 px-3 text-sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Sao chép email
          </Button>
          
          <Button
            variant="outline"
            onClick={() => copyToClipboard(nguoiDung.ho_ten)}
            className="h-9 px-3 text-sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Sao chép tên
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/nguoi-dung/${userId}/chinh-sua`}>
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
          {/* User Information */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Users className="h-5 w-5 text-blue-600" />
                Thông tin chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Họ và tên</h4>
                      <p className="text-gray-700 font-medium">{nguoiDung.ho_ten}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Địa chỉ email</h4>
                      <p className="text-gray-700">{nguoiDung.email}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Vai trò</h4>
                      <Badge variant="outline" className={`${vaiTroColors[nguoiDung.vai_tro]} border-purple-300`}>
                        {getRoleIcon(nguoiDung.vai_tro)}
                        <span className="ml-1">{vaiTroLabels[nguoiDung.vai_tro]}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Ngày tham gia</h4>
                      <p className="text-gray-700">{formatDateTime(nguoiDung.ngay_tao)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Published */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-blue-600" />
                Tài liệu đã ban hành
                <Badge variant="secondary" className="ml-2">
                  {hoSoList.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {hoSoList.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">Người dùng này chưa ban hành tài liệu nào</p>
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
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(hoSo.ngay_ban_hanh)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {hoSo.tinh_trang}
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
                    <Link href={`/ho-so?nguoi_ban_hanh=${userId}`}>
                      <Button variant="outline" size="sm">
                        Xem tất cả tài liệu
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
                    <span className="text-sm text-gray-700">Tài liệu ban hành</span>
                  </div>
                  <span className="font-semibold text-blue-600">{hoSoList.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Trạng thái</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Hoạt động
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-700">Quyền hạn</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${vaiTroColors[nguoiDung.vai_tro]} border-purple-300`}>
                    {vaiTroLabels[nguoiDung.vai_tro]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Clock className="h-5 w-5 text-gray-600" />
                Thông tin tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo tài khoản</p>
                    <p className="font-medium text-gray-900">{formatDateTime(nguoiDung.ngay_tao)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Lần đăng nhập cuối</p>
                    <p className="font-medium text-gray-900">Đang hoạt động</p>
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