'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ActionBar, ActionBarSection, ActionBarButton, ActionBarIconButton } from '@/components/ui/action-bar'
import { Plus, Search, Edit, Trash2, RefreshCw, Filter, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

// Component cho header có thể sắp xếp
interface SortableHeaderProps {
  field: keyof NguoiDung
  currentSortField: keyof NguoiDung
  sortDirection: 'asc' | 'desc'
  onSort: (field: keyof NguoiDung) => void
  children: React.ReactNode
}

function SortableHeader({ field, currentSortField, sortDirection, onSort, children }: SortableHeaderProps) {
  const isActive = currentSortField === field;
  
  return (
    <th 
      className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col">
          {isActive ? (
            sortDirection === 'asc' ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )
          ) : (
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          )}
        </div>
      </div>
    </th>
  );
}

interface NguoiDung {
  id: string
  ho_ten: string
  email: string
  vai_tro: 'quan_tri' | 'phe_duyet' | 'nguoi_dung'
  ngay_tao: string
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

export default function NguoiDungPage() {
  const [nguoiDungList, setNguoiDungList] = useState<NguoiDung[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  
  // States cho sắp xếp và phân trang
  const [sortField, setSortField] = useState<keyof NguoiDung>('ho_ten')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchNguoiDung()
  }, [])

  const fetchNguoiDung = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('nguoi_dung')
        .select('*')
        .order('ho_ten')

      if (error) throw error

      setNguoiDungList(data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Xử lý sắp xếp
  const handleSort = (field: keyof NguoiDung) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset về trang đầu khi sắp xếp
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return

    try {
      const { error } = await supabase
        .from('nguoi_dung')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công",
      })
      
      fetchNguoiDung()
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng. Người dùng có thể đang được tham chiếu trong hồ sơ.",
        variant: "destructive",
      })
    }
  }

  // Lọc dữ liệu
  const filteredNguoiDung = nguoiDungList.filter(nguoiDung => {
    const matchesSearch = nguoiDung.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nguoiDung.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRole === 'all' || nguoiDung.vai_tro === filterRole
    return matchesSearch && matchesFilter
  })

  // Sắp xếp dữ liệu
  const sortedNguoiDung = [...filteredNguoiDung].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Phân trang
  const totalPages = Math.ceil(sortedNguoiDung.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNguoiDung = sortedNguoiDung.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <p>Đang tải dữ liệu...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-0">
        {/* Page Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
              <p className="text-gray-600 mt-2">
                Hiển thị {paginatedNguoiDung.length} trên tổng số {sortedNguoiDung.length} người dùng
                {sortedNguoiDung.length !== nguoiDungList.length && ` (đã lọc từ ${nguoiDungList.length} người dùng)`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <ActionBar>
          <ActionBarSection>
            <Link href="/nguoi-dung/tao-moi">
              <ActionBarButton icon={<Plus className="h-4 w-4" />} shortcut="Ctrl+N">
                Thêm người dùng
              </ActionBarButton>
            </Link>
            <ActionBarIconButton 
              icon={<RefreshCw className="h-4 w-4" />} 
              onClick={fetchNguoiDung}
              tooltip="Làm mới dữ liệu"
            />
          </ActionBarSection>
          
          <ActionBarSection align="right">
            <div className="flex items-center gap-2">
              <ActionBarIconButton 
                icon={<Filter className="h-4 w-4" />}
                tooltip="Bộ lọc nâng cao"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-10 text-sm border-input focus:border-primary transition-colors"
                />
              </div>
            </div>
          </ActionBarSection>
        </ActionBar>

        {/* Filter Bar */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-4">
            <Label htmlFor="filter" className="text-sm font-medium">Lọc theo vai trò:</Label>
            <select
              id="filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-10 px-3 py-1 border border-input bg-background rounded-md text-sm min-w-[140px]"
            >
              <option value="all">Tất cả</option>
              <option value="quan_tri">Quản trị viên</option>
              <option value="phe_duyet">Người phê duyệt</option>
              <option value="nguoi_dung">Người dùng</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="grid gap-4">
            {sortedNguoiDung.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg">Không tìm thấy người dùng nào</p>
                  <p className="text-gray-400 text-sm mt-2">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <SortableHeader field="ho_ten" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Họ tên
                      </SortableHeader>
                      <SortableHeader field="email" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Email
                      </SortableHeader>
                      <SortableHeader field="vai_tro" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Vai trò
                      </SortableHeader>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedNguoiDung.map((nguoiDung) => (
                      <tr key={nguoiDung.id} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{nguoiDung.ho_ten}</td>
                        <td className="px-4 py-3 text-muted-foreground">{nguoiDung.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={vaiTroColors[nguoiDung.vai_tro]}>
                            {vaiTroLabels[nguoiDung.vai_tro]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/nguoi-dung/${nguoiDung.id}/chinh-sua`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(nguoiDung.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Hiển thị</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="h-8 px-2 border border-input bg-background rounded text-sm"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span>trên tổng số {sortedNguoiDung.length} người dùng</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="h-8 px-3"
                      >
                        Trước
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber: number;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className="h-8 w-8 p-0"
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 px-3"
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}