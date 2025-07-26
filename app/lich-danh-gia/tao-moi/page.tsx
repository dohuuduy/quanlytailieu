'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import Link from 'next/link'

interface TieuChuan {
  id: string
  ten_tieu_chuan: string
}

interface AuditorOption {
  value: string
  label: string
}

interface ToChucOption {
  value: string
  label: string
}

interface AuditorData {
  auditor: string
}

interface OrgData {
  to_chuc_danh_gia: string
}

export default function TaoMoiLichDanhGiaPage() {
  const [formData, setFormData] = useState({
    tieu_chuan_id: '',
    ngay_du_kien: '',
    ngay_bat_dau_thuc_te: '',
    ngay_ket_thuc_thuc_te: '',
    auditor: '',
    to_chuc_danh_gia: '',
    trang_thai: 'ke_hoach' as 'ke_hoach' | 'dang_thuc_hien' | 'hoan_thanh' | 'huy_bo',
    ghi_chu: ''
  })
  
  const [tieuChuanList, setTieuChuanList] = useState<TieuChuan[]>([])
  const [auditorOptions, setAuditorOptions] = useState<AuditorOption[]>([])
  const [toChucOptions, setToChucOptions] = useState<ToChucOption[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const { toast } = useToast()
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user)
    if (!user) {
      console.log('No user authenticated')
    }
  }

  const fetchData = async () => {
    try {
      // Fetch standards
      const { data: standards, error: standardsError } = await supabase
        .from('tieu_chuan')
        .select('id, ten_tieu_chuan')
        .order('ten_tieu_chuan')

      if (standardsError) throw standardsError

      // Fetch existing auditors from lich_danh_gia table
      const { data: auditorData, error: auditorError } = await supabase
        .from('lich_danh_gia')
        .select('auditor')
        .not('auditor', 'is', null)

      if (auditorError) throw auditorError

      // Fetch existing organizations from lich_danh_gia table
      const { data: orgData, error: orgError } = await supabase
        .from('lich_danh_gia')
        .select('to_chuc_danh_gia')
        .not('to_chuc_danh_gia', 'is', null)

      if (orgError) throw orgError

      // Create unique auditor options
      const typedAuditorData = auditorData as AuditorData[] | null
      const typedOrgData = orgData as OrgData[] | null
      
      const uniqueAuditors = Array.from(new Set(typedAuditorData?.map(item => item.auditor) || []))
      const auditorOptions = uniqueAuditors.map(auditor => ({
        value: auditor,
        label: auditor
      }))

      // Create unique organization options
      const uniqueOrgs = Array.from(new Set(typedOrgData?.map(item => item.to_chuc_danh_gia) || []))
      const orgOptions = uniqueOrgs.map(org => ({
        value: org,
        label: org
      }))

      // Add some default options
      const defaultAuditors = [
        { value: 'Nguyễn Văn A', label: 'Nguyễn Văn A' },
        { value: 'Trần Thị B', label: 'Trần Thị B' },
        { value: 'Lê Văn C', label: 'Lê Văn C' },
        { value: 'Phạm Thị D', label: 'Phạm Thị D' },
        { value: 'Hoàng Văn E', label: 'Hoàng Văn E' }
      ]

      const defaultOrgs = [
        { value: 'TÜV SÜD', label: 'TÜV SÜD' },
        { value: 'SGS Vietnam', label: 'SGS Vietnam' },
        { value: 'Bureau Veritas', label: 'Bureau Veritas' },
        { value: 'Control Union', label: 'Control Union' },
        { value: 'SCS Global Services', label: 'SCS Global Services' },
        { value: 'Intertek', label: 'Intertek' },
        { value: 'DNV GL', label: 'DNV GL' },
        { value: 'BVQI', label: 'BVQI' }
      ]

      // Merge and remove duplicates
      const allAuditors = [...defaultAuditors, ...auditorOptions]
      const allOrgs = [...defaultOrgs, ...orgOptions]

      const uniqueAuditorOptions = allAuditors.filter((item, index, self) => 
        index === self.findIndex(t => t.value === item.value)
      )

      const uniqueOrgOptions = allOrgs.filter((item, index, self) => 
        index === self.findIndex(t => t.value === item.value)
      )

      setTieuChuanList(standards || [])
      setAuditorOptions(uniqueAuditorOptions)
      setToChucOptions(uniqueOrgOptions)
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu cần thiết",
        variant: "destructive",
      })
    } finally {
      setDataLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.tieu_chuan_id) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tiêu chuẩn",
        variant: "destructive",
      })
      return false
    }

    if (!formData.ngay_du_kien) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày dự kiến",
        variant: "destructive",
      })
      return false
    }

    // Validate actual dates if provided - ngày kết thúc có thể bằng ngày bắt đầu
    if (formData.ngay_bat_dau_thuc_te && formData.ngay_ket_thuc_thuc_te) {
      if (new Date(formData.ngay_bat_dau_thuc_te) > new Date(formData.ngay_ket_thuc_thuc_te)) {
        toast({
          title: "Lỗi",
          description: "Ngày kết thúc thực tế không được nhỏ hơn ngày bắt đầu thực tế",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('lich_danh_gia')
        .insert([{
          tieu_chuan_id: formData.tieu_chuan_id,
          ngay_du_kien: formData.ngay_du_kien,
          ngay_bat_dau_thuc_te: formData.ngay_bat_dau_thuc_te || null,
          ngay_ket_thuc_thuc_te: formData.ngay_ket_thuc_thuc_te || null,
          auditor: formData.auditor.trim() || null,
          to_chuc_danh_gia: formData.to_chuc_danh_gia.trim() || null,
          trang_thai: formData.trang_thai,
          ghi_chu: formData.ghi_chu.trim() || null
        }])
        .select()

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã tạo lịch đánh giá thành công",
      })

      router.push('/lich-danh-gia')
    } catch (error) {
      console.error('Lỗi khi tạo lịch đánh giá:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo lịch đánh giá",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/lich-danh-gia">
            <Button variant="outline" size="sm" className="w-fit">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tạo lịch đánh giá mới
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Tạo lịch trình đánh giá theo tiêu chuẩn</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form Section - 2/3 width */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  Thông tin lịch đánh giá
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Thông tin cơ bản
                    </h3>
                    
                    {/* Tiêu chuẩn */}
                    <div className="space-y-3">
                      <Label htmlFor="tieu_chuan_id" className="text-sm font-medium text-gray-700">
                        Tiêu chuẩn <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="tieu_chuan_id"
                        value={formData.tieu_chuan_id}
                        onChange={(e) => handleInputChange('tieu_chuan_id', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Chọn tiêu chuẩn...</option>
                        {tieuChuanList.map((standard) => (
                          <option key={standard.id} value={standard.id}>
                            {standard.ten_tieu_chuan}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trạng thái */}
                    <div className="space-y-3">
                      <Label htmlFor="trang_thai" className="text-sm font-medium text-gray-700">
                        Trạng thái
                      </Label>
                      <select
                        id="trang_thai"
                        value={formData.trang_thai}
                        onChange={(e) => handleInputChange('trang_thai', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="ke_hoach">Kế hoạch</option>
                        <option value="dang_thuc_hien">Đang thực hiện</option>
                        <option value="hoan_thanh">Hoàn thành</option>
                        <option value="huy_bo">Hủy bỏ</option>
                      </select>
                    </div>
                  </div>

                  {/* Schedule Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Lịch trình
                    </h3>
                    
                    {/* Ngày dự kiến */}
                    <div className="space-y-3">
                      <Label htmlFor="ngay_du_kien" className="text-sm font-medium text-gray-700">
                        Ngày dự kiến <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ngay_du_kien"
                        type="date"
                        value={formData.ngay_du_kien}
                        onChange={(e) => handleInputChange('ngay_du_kien', e.target.value)}
                        className="px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Ngày thực tế */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="ngay_bat_dau_thuc_te" className="text-sm font-medium text-gray-700">
                          Ngày bắt đầu thực tế
                        </Label>
                        <Input
                          id="ngay_bat_dau_thuc_te"
                          type="date"
                          value={formData.ngay_bat_dau_thuc_te}
                          onChange={(e) => handleInputChange('ngay_bat_dau_thuc_te', e.target.value)}
                          className="px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="ngay_ket_thuc_thuc_te" className="text-sm font-medium text-gray-700">
                          Ngày kết thúc thực tế
                        </Label>
                        <Input
                          id="ngay_ket_thuc_thuc_te"
                          type="date"
                          value={formData.ngay_ket_thuc_thuc_te}
                          onChange={(e) => handleInputChange('ngay_ket_thuc_thuc_te', e.target.value)}
                          className="px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Team Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Đội ngũ đánh giá
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="auditor" className="text-sm font-medium text-gray-700">
                          Auditor
                        </Label>
                        <select
                          id="auditor"
                          value={formData.auditor}
                          onChange={(e) => handleInputChange('auditor', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">Chọn auditor...</option>
                          {auditorOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="to_chuc_danh_gia" className="text-sm font-medium text-gray-700">
                          Tổ chức đánh giá
                        </Label>
                        <select
                          id="to_chuc_danh_gia"
                          value={formData.to_chuc_danh_gia}
                          onChange={(e) => handleInputChange('to_chuc_danh_gia', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">Chọn tổ chức...</option>
                          {toChucOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Ghi chú
                    </h3>
                    
                    <div className="space-y-3">
                      <Label htmlFor="ghi_chu" className="text-sm font-medium text-gray-700">
                        Ghi chú thêm
                      </Label>
                      <Textarea
                        id="ghi_chu"
                        value={formData.ghi_chu}
                        onChange={(e) => handleInputChange('ghi_chu', e.target.value)}
                        placeholder="Ghi chú thêm về lịch đánh giá..."
                        rows={4}
                        className="px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center gap-4 pt-6 border-t">
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-base font-medium"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {loading ? 'Đang tạo...' : 'Tạo lịch đánh giá'}
                    </Button>
                    <Link href="/lich-danh-gia">
                      <Button type="button" variant="outline" className="px-8 py-3 text-base">
                        Hủy
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-6">
              {/* Help Card */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-blue-800">
                    💡 Hướng dẫn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-blue-700 p-4 sm:p-6 pt-0">
                  <div>
                    <h4 className="font-semibold mb-2">Thông tin bắt buộc:</h4>
                    <ul className="space-y-1 text-blue-600">
                      <li>• Tiêu chuẩn cần đánh giá</li>
                      <li>• Ngày dự kiến thực hiện</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Lưu ý:</h4>
                    <ul className="space-y-1 text-blue-600">
                      <li>• Ngày kết thúc có thể bằng ngày bắt đầu</li>
                      <li>• Auditor và tổ chức có thể để trống</li>
                      <li>• Trạng thái mặc định là "Kế hoạch"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Status Guide */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-gray-800">
                    📋 Trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm p-4 sm:p-6 pt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></div>
                    <span><strong>Kế hoạch:</strong> Chưa bắt đầu</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shrink-0"></div>
                    <span><strong>Đang thực hiện:</strong> Đang tiến hành</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 shrink-0"></div>
                    <span><strong>Hoàn thành:</strong> Đã kết thúc</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 shrink-0"></div>
                    <span><strong>Hủy bỏ:</strong> Không thực hiện</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-green-800">
                    ⚡ Mẹo nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-700 p-4 sm:p-6 pt-0">
                  <p>• Sử dụng Ctrl+S để lưu nhanh</p>
                  <p>• Có thể chỉnh sửa sau khi tạo</p>
                  <p>• Kiểm tra lại thông tin trước khi lưu</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}