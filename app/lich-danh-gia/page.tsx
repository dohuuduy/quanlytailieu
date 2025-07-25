'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CalendarDays,
  Building,
  User,
  XCircle
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

export default function LichDanhGiaPage() {
  const [lichDanhGiaList, setLichDanhGiaList] = useState<LichDanhGia[]>([])
  const [filteredList, setFilteredList] = useState<LichDanhGia[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchLichDanhGia()
  }, [])

  useEffect(() => {
    filterData()
  }, [lichDanhGiaList, searchTerm, filterStatus])

  const fetchLichDanhGia = async () => {
    try {
      const { data, error } = await supabase
        .from('lich_danh_gia')
        .select(`
          *,
          tieu_chuan(ten_tieu_chuan)
        `)
        .order('ngay_du_kien', { ascending: true })

      if (error) throw error
      setLichDanhGiaList(data || [])
    } catch (error) {
      console.error('Lỗi khi tải lịch đánh giá:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lịch đánh giá",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filtered = lichDanhGiaList

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.tieu_chuan?.ten_tieu_chuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.auditor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.to_chuc_danh_gia?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.trang_thai === filterStatus)
    }

    setFilteredList(filtered)
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch đánh giá này?')) return

    try {
      const { error } = await supabase
        .from('lich_danh_gia')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã xóa lịch đánh giá thành công",
      })

      fetchLichDanhGia()
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
      case 'ke_hoach': return <Clock className="h-4 w-4" />
      case 'dang_thuc_hien': return <AlertTriangle className="h-4 w-4" />
      case 'hoan_thanh': return <CheckCircle className="h-4 w-4" />
      case 'huy_bo': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredList.slice(startIndex, endIndex)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p>Đang tải dữ liệu...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch đánh giá</h1>
            <p className="text-gray-600 mt-1">Quản lý lịch trình đánh giá theo tiêu chuẩn</p>
          </div>
          <Link href="/lich-danh-gia/tao-moi">
            <Button className="h-10 px-4 font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Tạo lịch đánh giá
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng lịch đánh giá</p>
                  <p className="text-2xl font-bold">{lichDanhGiaList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang thực hiện</p>
                  <p className="text-2xl font-bold">
                    {lichDanhGiaList.filter(item => item.trang_thai === 'dang_thuc_hien').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kế hoạch</p>
                  <p className="text-2xl font-bold">
                    {lichDanhGiaList.filter(item => item.trang_thai === 'ke_hoach').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hoàn thành</p>
                  <p className="text-2xl font-bold">
                    {lichDanhGiaList.filter(item => item.trang_thai === 'hoan_thanh').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tiêu chuẩn, auditor, tổ chức..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="ke_hoach">Kế hoạch</option>
                  <option value="dang_thuc_hien">Đang thực hiện</option>
                  <option value="hoan_thanh">Hoàn thành</option>
                  <option value="huy_bo">Hủy bỏ</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách lịch đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            {currentItems.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Chưa có lịch đánh giá nào</p>
                <Link href="/lich-danh-gia/tao-moi">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo lịch đánh giá đầu tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Tiêu chuẩn</th>
                      <th className="text-left p-3 font-medium">Ngày dự kiến</th>
                      <th className="text-left p-3 font-medium">Thực tế</th>
                      <th className="text-left p-3 font-medium">Auditor</th>
                      <th className="text-left p-3 font-medium">Tổ chức</th>
                      <th className="text-left p-3 font-medium">Trạng thái</th>
                      <th className="text-left p-3 font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{item.tieu_chuan?.ten_tieu_chuan}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(item.ngay_du_kien)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            {item.ngay_bat_dau_thuc_te ? (
                              <div>
                                <div>Bắt đầu: {formatDate(item.ngay_bat_dau_thuc_te)}</div>
                                {item.ngay_ket_thuc_thuc_te && (
                                  <div>Kết thúc: {formatDate(item.ngay_ket_thuc_thuc_te)}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">Chưa bắt đầu</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{item.auditor || 'Chưa xác định'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{item.to_chuc_danh_gia || 'Chưa xác định'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={trangThaiColors[item.trang_thai]}>
                            {getStatusIcon(item.trang_thai)}
                            <span className="ml-1">{trangThaiLabels[item.trang_thai]}</span>
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Link href={`/lich-danh-gia/${item.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/lich-danh-gia/${item.id}/chinh-sua`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredList.length)} trong tổng số {filteredList.length} kết quả
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}