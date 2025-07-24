'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ActionBar, ActionBarSection, ActionBarButton, ActionBarIconButton } from '@/components/ui/action-bar'
import { Plus, Search, Edit, Trash2, RefreshCw, FileText, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'

// Component cho header có thể sắp xếp
interface SortableHeaderProps {
  field: keyof TieuChuan
  currentSortField: keyof TieuChuan
  sortDirection: 'asc' | 'desc'
  onSort: (field: keyof TieuChuan) => void
  children: React.ReactNode
  className?: string
}

function SortableHeader({ field, currentSortField, sortDirection, onSort, children, className = "px-4 py-3 text-left font-medium text-muted-foreground" }: SortableHeaderProps) {
  const isActive = currentSortField === field;
  
  return (
    <th 
      className={`${className} cursor-pointer hover:bg-muted/30 transition-colors select-none`}
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

interface TieuChuan {
  id: string
  ten_tieu_chuan: string
  mo_ta: string | null
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
}

interface HoSoCount {
  tieu_chuan_id: string
  count: number
}

export default function TieuChuanPage() {
  const [tieuChuanList, setTieuChuanList] = useState<TieuChuan[]>([])
  const [hoSoCounts, setHoSoCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // States cho sắp xếp và phân trang
  const [sortField, setSortField] = useState<keyof TieuChuan>('ten_tieu_chuan')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchTieuChuan()
    fetchHoSoCounts()
  }, [])

  const fetchTieuChuan = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tieu_chuan')
        .select('*')
        .order('ten_tieu_chuan')

      if (error) throw error

      setTieuChuanList(data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách tiêu chuẩn:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tiêu chuẩn",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchHoSoCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('tai_lieu_tieu_chuan')
        .select('tieu_chuan_id, count()')
        .group('tieu_chuan_id')

      if (error) throw error

      const counts: Record<string, number> = {}
      if (data) {
        data.forEach((item: HoSoCount) => {
          counts[item.tieu_chuan_id] = item.count
        })
      }
      
      setHoSoCounts(counts)
    } catch (error) {
      console.error('Lỗi khi tải số lượng hồ sơ:', error)
    }
  }

  // Xử lý sắp xếp
  const handleSort = (field: keyof TieuChuan) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset về trang đầu khi sắp xếp
  }

  const handleDelete = async (id: string) => {
    // Kiểm tra xem tiêu chuẩn có đang được sử dụng không
    if (hoSoCounts[id] && hoSoCounts[id] > 0) {
      toast({
        title: "Không thể xóa",
        description: `Tiêu chuẩn này đang được sử dụng trong ${hoSoCounts[id]} hồ sơ.`,
        variant: "destructive",
      })
      return
    }

    if (!confirm('Bạn có chắc chắn muốn xóa tiêu chuẩn này?')) return

    try {
      const { error } = await supabase
        .from('tieu_chuan')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã xóa tiêu chuẩn thành công",
      })
      
      fetchTieuChuan()
    } catch (error) {
      console.error('Lỗi khi xóa tiêu chuẩn:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa tiêu chuẩn",
        variant: "destructive",
      })
    }
  }

  // Lọc dữ liệu
  const filteredTieuChuan = tieuChuanList.filter(tieu_chuan => {
    return tieu_chuan.ten_tieu_chuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (tieu_chuan.mo_ta && tieu_chuan.mo_ta.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  // Sắp xếp dữ liệu
  const sortedTieuChuan = [...filteredTieuChuan].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Phân trang
  const totalPages = Math.ceil(sortedTieuChuan.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTieuChuan = sortedTieuChuan.slice(startIndex, startIndex + itemsPerPage)

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
              <h1 className="text-3xl font-bold text-gray-900">Danh mục Tiêu chuẩn</h1>
              <p className="text-gray-600 mt-2">
                Hiển thị {paginatedTieuChuan.length} trên tổng số {sortedTieuChuan.length} tiêu chuẩn
                {sortedTieuChuan.length !== tieuChuanList.length && ` (đã lọc từ ${tieuChuanList.length} tiêu chuẩn)`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <ActionBar>
          <ActionBarSection>
            <Link href="/danh-muc/tieu-chuan/tao-moi">
              <ActionBarButton icon={<Plus className="h-4 w-4" />}>
                Thêm tiêu chuẩn
              </ActionBarButton>
            </Link>
            <ActionBarIconButton 
              icon={<RefreshCw className="h-4 w-4" />} 
              onClick={() => {
                fetchTieuChuan();
                fetchHoSoCounts();
              }}
              tooltip="Làm mới dữ liệu"
            />
          </ActionBarSection>
          
          <ActionBarSection align="right">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tiêu chuẩn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 h-10 text-sm border-input focus:border-primary transition-colors"
              />
            </div>
          </ActionBarSection>
        </ActionBar>

        {/* Content Area */}
        <div className="p-6">
          <div className="grid gap-4">
            {sortedTieuChuan.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg">Không tìm thấy tiêu chuẩn nào</p>
                  <p className="text-gray-400 text-sm mt-2">Thử thay đổi từ khóa tìm kiếm hoặc thêm tiêu chuẩn mới</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <SortableHeader field="ten_tieu_chuan" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Tên tiêu chuẩn
                      </SortableHeader>
                      <SortableHeader field="mo_ta" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Mô tả
                      </SortableHeader>
                      <SortableHeader field="tinh_trang" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} className="px-4 py-3 text-center font-medium text-muted-foreground">
                        <div className="text-center">Tình trạng</div>
                      </SortableHeader>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Số hồ sơ</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTieuChuan.map((tieu_chuan) => (
                      <tr key={tieu_chuan.id} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{tieu_chuan.ten_tieu_chuan}</td>
                        <td className="px-4 py-3 text-muted-foreground">{tieu_chuan.mo_ta || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tieu_chuan.tinh_trang === 'hieu_luc' 
                                ? 'bg-green-100 text-green-800' 
                                : tieu_chuan.tinh_trang === 'cho_duyet'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tieu_chuan.tinh_trang === 'hieu_luc' 
                                ? 'Hiệu lực' 
                                : tieu_chuan.tinh_trang === 'cho_duyet'
                                ? 'Chờ duyệt'
                                : 'Hết hiệu lực'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{hoSoCounts[tieu_chuan.id] || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/danh-muc/tieu-chuan/${tieu_chuan.id}/chinh-sua`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(tieu_chuan.id)}
                              disabled={!!(hoSoCounts[tieu_chuan.id] && hoSoCounts[tieu_chuan.id] > 0)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                              title={hoSoCounts[tieu_chuan.id] && hoSoCounts[tieu_chuan.id] > 0 ? 'Không thể xóa vì đang được sử dụng' : 'Xóa'}
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
                      <span>trên tổng số {sortedTieuChuan.length} tiêu chuẩn</span>
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