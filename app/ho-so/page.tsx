'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ActionBar, ActionBarSection, ActionBarButton, ActionBarIconButton } from '@/components/ui/action-bar'
import { Plus, Search, Edit, Trash2, Eye, Download, Filter, RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'

// Component cho header có thể sắp xếp
interface SortableHeaderProps {
  field: keyof HoSo
  currentSortField: keyof HoSo
  sortDirection: 'asc' | 'desc'
  onSort: (field: keyof HoSo) => void
  children: React.ReactNode
}

function SortableHeader({ field, currentSortField, sortDirection, onSort, children }: SortableHeaderProps) {
  const isActive = currentSortField === field;
  
  return (
    <th 
      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors select-none"
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

interface HoSo {
  id: string
  ma_tai_lieu: string
  ten_tai_lieu: string
  phien_ban: string
  ngay_ban_hanh: string
  ngay_het_hieu_luc: string | null
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
  ghi_chu: string | null
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

export default function HoSoPage() {
  const [hoSoList, setHoSoList] = useState<HoSo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortField, setSortField] = useState<keyof HoSo>('ma_tai_lieu')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // States cho chọn nhiều hồ sơ
  const [selectedHoSo, setSelectedHoSo] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchHoSo()
  }, [])

  const fetchHoSo = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ho_so')
        .select(`
          *,
          nguoi_ban_hanh:nguoi_dung!nguoi_ban_hanh_id(ho_ten),
          loai_tai_lieu(ten_loai)
        `)
        .order('ma_tai_lieu', { ascending: true })

      if (error) throw error

      setHoSoList(data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách hồ sơ:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách hồ sơ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Lọc hồ sơ theo tìm kiếm và trạng thái
  const filteredHoSo = hoSoList.filter(hoSo => {
    const matchesSearch = hoSo.ma_tai_lieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hoSo.ten_tai_lieu.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || hoSo.tinh_trang === filterStatus
    return matchesSearch && matchesFilter
  })
  
  // Sắp xếp hồ sơ theo trường và hướng đã chọn
  const sortedHoSo = [...filteredHoSo].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    // Xử lý các trường đặc biệt
    if (sortField === 'loai_tai_lieu') {
      aValue = a.loai_tai_lieu.ten_loai;
      bValue = b.loai_tai_lieu.ten_loai;
    } else if (sortField === 'nguoi_ban_hanh') {
      aValue = a.nguoi_ban_hanh.ho_ten;
      bValue = b.nguoi_ban_hanh.ho_ten;
    }
    
    // So sánh các giá trị
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Mặc định cho các kiểu dữ liệu khác
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Tính toán phân trang
  const totalPages = Math.ceil(sortedHoSo.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHoSo = sortedHoSo.slice(startIndex, startIndex + itemsPerPage);
  
  // Hàm xử lý sắp xếp khi click vào header của cột
  const handleSort = (field: keyof HoSo) => {
    if (sortField === field) {
      // Nếu đang sắp xếp theo field này, đổi hướng sắp xếp
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nếu sắp xếp theo field mới, mặc định sắp xếp tăng dần
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset về trang đầu khi sắp xếp
  };

  // Xử lý chọn/bỏ chọn hồ sơ
  const handleSelectHoSo = (hoSoId: string) => {
    const newSelected = new Set(selectedHoSo);
    if (newSelected.has(hoSoId)) {
      newSelected.delete(hoSoId);
    } else {
      newSelected.add(hoSoId);
    }
    setSelectedHoSo(newSelected);
    setSelectAll(newSelected.size === paginatedHoSo.length);
  };

  // Xử lý chọn/bỏ chọn tất cả hồ sơ trong trang hiện tại
  const handleSelectAll = () => {
    if (selectAll) {
      // Bỏ chọn tất cả hồ sơ trong trang hiện tại
      const newSelected = new Set(selectedHoSo);
      paginatedHoSo.forEach(hoSo => newSelected.delete(hoSo.id));
      setSelectedHoSo(newSelected);
      setSelectAll(false);
    } else {
      // Chọn tất cả hồ sơ trong trang hiện tại
      const newSelected = new Set(selectedHoSo);
      paginatedHoSo.forEach(hoSo => newSelected.add(hoSo.id));
      setSelectedHoSo(newSelected);
      setSelectAll(true);
    }
  };

  // Xử lý xóa nhiều hồ sơ
  const handleDeleteSelected = async () => {
    if (selectedHoSo.size === 0) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedHoSo.size} hồ sơ đã chọn?`)) return;

    try {
      const { error } = await supabase
        .from('ho_so')
        .delete()
        .in('id', Array.from(selectedHoSo));

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã xóa ${selectedHoSo.size} hồ sơ thành công`,
      });
      
      setSelectedHoSo(new Set());
      setSelectAll(false);
      fetchHoSo();
    } catch (error) {
      console.error('Lỗi khi xóa hồ sơ:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa hồ sơ đã chọn",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) return

    try {
      const { error } = await supabase
        .from('ho_so')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã xóa hồ sơ thành công",
      })
      
      fetchHoSo()
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

  return (
    <DashboardLayout>
      <div className="space-y-0">
        {/* Page Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Hồ sơ Tài liệu</h1>
              <p className="text-gray-600 mt-2">
                Hiển thị {paginatedHoSo.length} trên tổng số {sortedHoSo.length} hồ sơ
                {sortedHoSo.length !== hoSoList.length && ` (đã lọc từ ${hoSoList.length} hồ sơ)`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <ActionBar>
          <ActionBarSection>
            <Link href="/ho-so/tao-moi">
              <ActionBarButton icon={<Plus className="h-4 w-4" />} shortcut="Ctrl+N">
                Tạo mới
              </ActionBarButton>
            </Link>
            <ActionBarButton icon={<Download className="h-4 w-4" />}>
              Xuất Excel
            </ActionBarButton>
            {selectedHoSo.size > 0 && (
              <ActionBarButton 
                icon={<Trash2 className="h-4 w-4" />}
                onClick={handleDeleteSelected}
                className="text-red-600 hover:text-red-700"
              >
                Xóa {selectedHoSo.size} hồ sơ
              </ActionBarButton>
            )}
            <ActionBarIconButton 
              icon={<RefreshCw className="h-4 w-4" />} 
              onClick={fetchHoSo}
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
                  placeholder="Tìm kiếm hồ sơ..."
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
            <Label htmlFor="filter" className="text-sm font-medium">Lọc theo tình trạng:</Label>
            <select
              id="filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 py-1 border border-input bg-background rounded-md text-sm min-w-[140px]"
            >
              <option value="all">Tất cả</option>
              <option value="hieu_luc">Hiệu lực</option>
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="het_hieu_luc">Hết hiệu lực</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {filteredHoSo.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">Không tìm thấy hồ sơ nào</p>
                <p className="text-gray-400 text-sm mt-2">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </th>
                      <SortableHeader field="ma_tai_lieu" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Mã tài liệu
                      </SortableHeader>
                      <SortableHeader field="ten_tai_lieu" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Tên tài liệu
                      </SortableHeader>
                      <SortableHeader field="phien_ban" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Phiên bản
                      </SortableHeader>
                      <SortableHeader field="loai_tai_lieu" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Loại
                      </SortableHeader>
                      <SortableHeader field="ngay_ban_hanh" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        Ngày ban hành
                      </SortableHeader>
                      <SortableHeader field="tinh_trang" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                        <div className="text-center">Tình trạng</div>
                      </SortableHeader>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHoSo.map((hoSo, index) => (
                      <tr 
                        key={hoSo.id} 
                        className={`border-b hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-muted/10'}`}
                      >
                        <td className="p-4 align-middle">
                          <input
                            type="checkbox"
                            checked={selectedHoSo.has(hoSo.id)}
                            onChange={() => handleSelectHoSo(hoSo.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="p-4 align-middle font-medium">{hoSo.ma_tai_lieu}</td>
                        <td className="p-4 align-middle max-w-[300px] truncate" title={hoSo.ten_tai_lieu}>
                          {hoSo.ten_tai_lieu}
                        </td>
                        <td className="p-4 align-middle">{hoSo.phien_ban}</td>
                        <td className="p-4 align-middle">{hoSo.loai_tai_lieu.ten_loai}</td>
                        <td className="p-4 align-middle">{formatDate(hoSo.ngay_ban_hanh)}</td>
                        <td className="p-4 align-middle">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tinhTrangColors[hoSo.tinh_trang]}`}>
                              {tinhTrangLabels[hoSo.tinh_trang]}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex justify-end gap-2">
                            <Link href={`/ho-so/${hoSo.id}`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-accent/80 transition-colors">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/ho-so/${hoSo.id}/chinh-sua`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-accent/80 transition-colors">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(hoSo.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50 transition-colors"
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
                    <span>trên tổng số {sortedHoSo.length} hồ sơ</span>
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
    </DashboardLayout>
  )
}