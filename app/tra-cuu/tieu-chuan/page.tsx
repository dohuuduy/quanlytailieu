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
import { Search, Filter, RefreshCw, Download, Copy, Printer, FileText, ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Component cho header có thể sắp xếp
interface SortableHeaderProps {
  field: string
  currentSortField: string
  sortDirection: 'asc' | 'desc'
  onSort: (field: string) => void
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

interface HoSo {
  id: string
  ma_tai_lieu: string
  ten_tai_lieu: string
  phien_ban: string
  ngay_ban_hanh: string
  ngay_het_hieu_luc: string | null
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
  ghi_chu: string | null
  link_tai_lieu: string | null
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

export default function TraCuuTieuChuanPage() {
  const [tieuChuanList, setTieuChuanList] = useState<TieuChuan[]>([])
  const [selectedTieuChuan, setSelectedTieuChuan] = useState<string>('')
  const [hoSoList, setHoSoList] = useState<HoSo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // States cho sắp xếp và phân trang
  const [sortField, setSortField] = useState<string>('ma_tai_lieu')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // States cho chọn nhiều tài liệu
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchTieuChuan()
  }, [])

  useEffect(() => {
    if (selectedTieuChuan) {
      fetchDocumentsByTieuChuan()
    } else {
      setHoSoList([])
    }
  }, [selectedTieuChuan])

  const fetchTieuChuan = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tieu_chuan')
        .select('*')
        .eq('tinh_trang', 'hieu_luc')
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

  const fetchDocumentsByTieuChuan = async () => {
    try {
      setLoadingDocuments(true)
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
            ghi_chu,
            link_tai_lieu,
            nguoi_ban_hanh:nguoi_dung!nguoi_ban_hanh_id(ho_ten),
            loai_tai_lieu(ten_loai)
          )
        `)
        .eq('tieu_chuan_id', selectedTieuChuan)

      if (error) throw error

      // Flatten dữ liệu và lọc ra các hồ sơ hợp lệ
      const documents = data
        ?.map((item: any) => item.ho_so)
        .filter((doc: any) => doc !== null) as HoSo[]

      setHoSoList(documents || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách tài liệu:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tài liệu",
        variant: "destructive",
      })
    } finally {
      setLoadingDocuments(false)
    }
  }

  // Xử lý sắp xếp
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  // Xử lý chọn/bỏ chọn tài liệu
  const handleSelectDocument = (docId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocuments(newSelected);
    setSelectAll(newSelected.size === paginatedHoSo.length);
  };

  // Xử lý chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectAll) {
      const newSelected = new Set(selectedDocuments);
      paginatedHoSo.forEach(doc => newSelected.delete(doc.id));
      setSelectedDocuments(newSelected);
      setSelectAll(false);
    } else {
      const newSelected = new Set(selectedDocuments);
      paginatedHoSo.forEach(doc => newSelected.add(doc.id));
      setSelectedDocuments(newSelected);
      setSelectAll(true);
    }
  };

  // Lọc dữ liệu
  const filteredHoSo = hoSoList.filter(hoSo => {
    const matchesSearch = hoSo.ma_tai_lieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hoSo.ten_tai_lieu.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || hoSo.tinh_trang === filterStatus
    return matchesSearch && matchesFilter
  })

  // Sắp xếp dữ liệu
  const sortedHoSo = [...filteredHoSo].sort((a, b) => {
    let aValue: any = a[sortField as keyof HoSo] || ''
    let bValue: any = b[sortField as keyof HoSo] || ''
    
    // Xử lý nested objects
    if (sortField === 'nguoi_ban_hanh') {
      aValue = a.nguoi_ban_hanh?.ho_ten || ''
      bValue = b.nguoi_ban_hanh?.ho_ten || ''
    } else if (sortField === 'loai_tai_lieu') {
      aValue = a.loai_tai_lieu?.ten_loai || ''
      bValue = b.loai_tai_lieu?.ten_loai || ''
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Phân trang
  const totalPages = Math.ceil(sortedHoSo.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedHoSo = sortedHoSo.slice(startIndex, startIndex + itemsPerPage)

  // Xuất PDF
  const handleExportPDF = () => {
    const selectedTieuChuanName = tieuChuanList.find(tc => tc.id === selectedTieuChuan)?.ten_tieu_chuan || 'Tiêu chuẩn'
    const documentsToExport = selectedDocuments.size > 0 
      ? sortedHoSo.filter(doc => selectedDocuments.has(doc.id))
      : sortedHoSo

    // Tạo nội dung HTML cho PDF
    const htmlContent = `
      <html>
        <head>
          <title>Danh sách tài liệu - ${selectedTieuChuanName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .hieu-luc { background-color: #d4edda; color: #155724; }
            .cho-duyet { background-color: #fff3cd; color: #856404; }
            .het-hieu-luc { background-color: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <h1>Danh sách tài liệu theo tiêu chuẩn: ${selectedTieuChuanName}</h1>
          <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
          <p>Tổng số tài liệu: ${documentsToExport.length}</p>
          <table>
            <thead>
              <tr>
                <th>Mã tài liệu</th>
                <th>Tên tài liệu</th>
                <th>Phiên bản</th>
                <th>Loại</th>
                <th>Ngày ban hành</th>
                <th>Tình trạng</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              ${documentsToExport.map(doc => `
                <tr>
                  <td>${doc.ma_tai_lieu}</td>
                  <td>${doc.ten_tai_lieu}</td>
                  <td>${doc.phien_ban}</td>
                  <td>${doc.loai_tai_lieu?.ten_loai || ''}</td>
                  <td>${formatDate(doc.ngay_ban_hanh)}</td>
                  <td><span class="status ${doc.tinh_trang}">${tinhTrangLabels[doc.tinh_trang]}</span></td>
                  <td>${doc.ghi_chu || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    // Tạo và download PDF
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tai-lieu-${selectedTieuChuanName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Thành công",
      description: `Đã xuất ${documentsToExport.length} tài liệu`,
    })
  }

  // Sao chép danh sách
  const handleCopyList = () => {
    const selectedTieuChuanName = tieuChuanList.find(tc => tc.id === selectedTieuChuan)?.ten_tieu_chuan || 'Tiêu chuẩn'
    const documentsToExport = selectedDocuments.size > 0 
      ? sortedHoSo.filter(doc => selectedDocuments.has(doc.id))
      : sortedHoSo

    const textContent = `Danh sách tài liệu theo tiêu chuẩn: ${selectedTieuChuanName}
Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}
Tổng số tài liệu: ${documentsToExport.length}

${documentsToExport.map((doc, index) => 
  `${index + 1}. ${doc.ma_tai_lieu} - ${doc.ten_tai_lieu} (v${doc.phien_ban}) - ${tinhTrangLabels[doc.tinh_trang]}`
).join('\n')}`

    navigator.clipboard.writeText(textContent).then(() => {
      toast({
        title: "Thành công",
        description: "Đã sao chép danh sách vào clipboard",
      })
    }).catch(() => {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép danh sách",
        variant: "destructive",
      })
    })
  }

  // In danh sách
  const handlePrint = () => {
    const selectedTieuChuanName = tieuChuanList.find(tc => tc.id === selectedTieuChuan)?.ten_tieu_chuan || 'Tiêu chuẩn'
    const documentsToExport = selectedDocuments.size > 0 
      ? sortedHoSo.filter(doc => selectedDocuments.has(doc.id))
      : sortedHoSo

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Danh sách tài liệu - ${selectedTieuChuanName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>Danh sách tài liệu theo tiêu chuẩn: ${selectedTieuChuanName}</h1>
            <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
            <p>Tổng số tài liệu: ${documentsToExport.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Mã tài liệu</th>
                  <th>Tên tài liệu</th>
                  <th>Phiên bản</th>
                  <th>Loại</th>
                  <th>Ngày ban hành</th>
                  <th>Tình trạng</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                ${documentsToExport.map(doc => `
                  <tr>
                    <td>${doc.ma_tai_lieu}</td>
                    <td>${doc.ten_tai_lieu}</td>
                    <td>${doc.phien_ban}</td>
                    <td>${doc.loai_tai_lieu?.ten_loai || ''}</td>
                    <td>${formatDate(doc.ngay_ban_hanh)}</td>
                    <td>${tinhTrangLabels[doc.tinh_trang]}</td>
                    <td>${doc.ghi_chu || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Tra cứu tài liệu theo Tiêu chuẩn</h1>
              <p className="text-gray-600 mt-2">
                {selectedTieuChuan ? (
                  <>
                    Hiển thị {paginatedHoSo.length} trên tổng số {sortedHoSo.length} tài liệu
                    {sortedHoSo.length !== hoSoList.length && ` (đã lọc từ ${hoSoList.length} tài liệu)`}
                  </>
                ) : (
                  'Chọn tiêu chuẩn để xem danh sách tài liệu liên quan'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <ActionBar>
          <ActionBarSection>
            {selectedDocuments.size > 0 && (
              <>
                <ActionBarButton 
                  icon={<Download className="h-4 w-4" />}
                  onClick={handleExportPDF}
                >
                  Xuất PDF ({selectedDocuments.size})
                </ActionBarButton>
                <ActionBarButton 
                  icon={<Copy className="h-4 w-4" />}
                  onClick={handleCopyList}
                >
                  Sao chép ({selectedDocuments.size})
                </ActionBarButton>
                <ActionBarButton 
                  icon={<Printer className="h-4 w-4" />}
                  onClick={handlePrint}
                >
                  In ({selectedDocuments.size})
                </ActionBarButton>
              </>
            )}
            {selectedTieuChuan && selectedDocuments.size === 0 && (
              <>
                <ActionBarButton 
                  icon={<Download className="h-4 w-4" />}
                  onClick={handleExportPDF}
                >
                  Xuất PDF
                </ActionBarButton>
                <ActionBarButton 
                  icon={<Copy className="h-4 w-4" />}
                  onClick={handleCopyList}
                >
                  Sao chép
                </ActionBarButton>
                <ActionBarButton 
                  icon={<Printer className="h-4 w-4" />}
                  onClick={handlePrint}
                >
                  In
                </ActionBarButton>
              </>
            )}
            <ActionBarIconButton 
              icon={<RefreshCw className="h-4 w-4" />} 
              onClick={() => {
                fetchTieuChuan()
                if (selectedTieuChuan) fetchDocumentsByTieuChuan()
              }}
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
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-10 text-sm border-input focus:border-primary transition-colors"
                  disabled={!selectedTieuChuan}
                />
              </div>
            </div>
          </ActionBarSection>
        </ActionBar>

        {/* Filter Bar */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="tieu-chuan" className="text-sm font-medium">Chọn tiêu chuẩn:</Label>
              <select
                id="tieu-chuan"
                value={selectedTieuChuan}
                onChange={(e) => {
                  setSelectedTieuChuan(e.target.value)
                  setSelectedDocuments(new Set())
                  setSelectAll(false)
                  setCurrentPage(1)
                }}
                className="h-10 px-3 py-1 border border-input bg-background rounded-md text-sm min-w-[200px]"
              >
                <option value="">-- Chọn tiêu chuẩn --</option>
                {tieuChuanList.map(tc => (
                  <option key={tc.id} value={tc.id}>{tc.ten_tieu_chuan}</option>
                ))}
              </select>
            </div>
            
            {selectedTieuChuan && (
              <div className="flex items-center gap-2">
                <Label htmlFor="filter-status" className="text-sm font-medium">Lọc theo tình trạng:</Label>
                <select
                  id="filter-status"
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
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {!selectedTieuChuan ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tra cứu tài liệu theo tiêu chuẩn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Chọn một tiêu chuẩn từ danh sách trên để xem các tài liệu liên quan.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tieuChuanList.slice(0, 6).map(tc => (
                    <Card 
                      key={tc.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedTieuChuan(tc.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm">{tc.ten_tieu_chuan}</h3>
                        {tc.mo_ta && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tc.mo_ta}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : loadingDocuments ? (
            <div className="text-center p-8">
              <p>Đang tải danh sách tài liệu...</p>
            </div>
          ) : sortedHoSo.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">Không tìm thấy tài liệu nào</p>
                <p className="text-gray-400 text-sm mt-2">
                  Tiêu chuẩn này chưa có tài liệu liên quan hoặc thử thay đổi bộ lọc
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-lg border">
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
                    <SortableHeader field="tinh_trang" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} className="px-4 py-3 text-center font-medium text-muted-foreground">
                      <div className="text-center">Tình trạng</div>
                    </SortableHeader>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Link</th>
                    <SortableHeader field="ghi_chu" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                      Ghi chú
                    </SortableHeader>
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
                          checked={selectedDocuments.has(hoSo.id)}
                          onChange={() => handleSelectDocument(hoSo.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-4 align-middle font-medium">{hoSo.ma_tai_lieu}</td>
                      <td className="p-4 align-middle">
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{hoSo.ten_tai_lieu}</p>
                          <p className="text-xs text-muted-foreground">
                            {hoSo.nguoi_ban_hanh?.ho_ten}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <Badge variant="outline">{hoSo.phien_ban}</Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="secondary" className="text-xs">
                          {hoSo.loai_tai_lieu?.ten_loai}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-sm">
                        {formatDate(hoSo.ngay_ban_hanh)}
                        {hoSo.ngay_het_hieu_luc && (
                          <div className="text-xs text-muted-foreground">
                            Hết: {formatDate(hoSo.ngay_het_hieu_luc)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle text-center">
                        <Badge 
                          variant="outline" 
                          className={tinhTrangColors[hoSo.tinh_trang]}
                        >
                          {tinhTrangLabels[hoSo.tinh_trang]}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-center">
                        {hoSo.link_tai_lieu ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(hoSo.link_tai_lieu!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="max-w-xs">
                          <p className="text-xs text-muted-foreground truncate">
                            {hoSo.ghi_chu || '—'}
                          </p>
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
                    <span>trên tổng số {sortedHoSo.length} tài liệu</span>
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