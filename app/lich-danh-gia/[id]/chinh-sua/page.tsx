'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function ChinhSuaLichDanhGiaPage() {
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
  const params = useParams()
  const supabase = createSupabaseClient()
  const lichDanhGiaId = params.id as string

  useEffect(() => {
    if (lichDanhGiaId) {
      fetchData()
      fetchLichDanhGia()
    }
  }, [lichDanhGiaId])

  const fetchData = async () => {
    try {
      // Fetch standards
      const { data: standards, error: standardsError } = await supabase
        .from('tieu_chuan')
        .select('id, ten_tieu_chuan')
        .order('ten_tieu_chuan')

      if (standardsError) throw standardsError

      // Fetch existing auditors and organizations
      const { data: auditorData, error: auditorError } = await supabase
        .from('lich_danh_gia')
        .select('auditor')
        .not('auditor', 'is', null)

      if (auditorError) throw auditorError

      const { data: orgData, error: orgError } = await supabase
        .from('lich_danh_gia')
        .select('to_chuc_danh_gia')
        .not('to_chuc_danh_gia', 'is', null)

      if (orgError) throw orgError

      // Create unique options
      const typedAuditorData = auditorData as AuditorData[] | null
      const typedOrgData = orgData as OrgData[] | null
      
      const uniqueAuditors = Array.from(new Set(typedAuditorData?.map(item => item.auditor) || []))
      const auditorOptions = uniqueAuditors.map(auditor => ({
        value: auditor,
        label: auditor
      }))

      const uniqueOrgs = Array.from(new Set(typedOrgData?.map(item => item.to_chuc_danh_gia) || []))
      const orgOptions = uniqueOrgs.map(org => ({
        value: org,
        label: org
      }))

      // Add default options
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

  const fetchLichDanhGia = async () => {
    try {
      const { data, error } = await supabase
        .from('lich_danh_gia')
        .select('*')
        .eq('id', lichDanhGiaId)
        .single()

      if (error) throw error

      setFormData({
        tieu_chuan_id: data.tieu_chuan_id || '',
        ngay_du_kien: data.ngay_du_kien || '',
        ngay_bat_dau_thuc_te: data.ngay_bat_dau_thuc_te || '',
        ngay_ket_thuc_thuc_te: data.ngay_ket_thuc_thuc_te || '',
        auditor: data.auditor || '',
        to_chuc_danh_gia: data.to_chuc_danh_gia || '',
        trang_thai: data.trang_thai || 'ke_hoach',
        ghi_chu: data.ghi_chu || ''
      })
    } catch (error) {
      console.error('Lỗi khi tải thông tin lịch đánh giá:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin lịch đánh giá",
        variant: "destructive",
      })
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
        .update({
          tieu_chuan_id: formData.tieu_chuan_id,
          ngay_du_kien: formData.ngay_du_kien,
          ngay_bat_dau_thuc_te: formData.ngay_bat_dau_thuc_te || null,
          ngay_ket_thuc_thuc_te: formData.ngay_ket_thuc_thuc_te || null,
          auditor: formData.auditor.trim() || null,
          to_chuc_danh_gia: formData.to_chuc_danh_gia.trim() || null,
          trang_thai: formData.trang_thai,
          ghi_chu: formData.ghi_chu.trim() || null
        })
        .eq('id', lichDanhGiaId)
        .select()

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã cập nhật lịch đánh giá thành công",
      })

      router.push(`/lich-danh-gia/${lichDanhGiaId}`)
    } catch (error) {
      console.error('Lỗi khi cập nhật lịch đánh giá:', error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật lịch đánh giá",
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/lich-danh-gia/${lichDanhGiaId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa lịch đánh giá</h1>
            <p className="text-gray-600">Cập nhật thông tin lịch trình đánh giá</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Thông tin lịch đánh giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tiêu chuẩn */}
              <div className="space-y-2">
                <Label htmlFor="tieu_chuan_id">
                  Tiêu chuẩn <span className="text-red-500">*</span>
                </Label>
                <select
                  id="tieu_chuan_id"
                  value={formData.tieu_chuan_id}
                  onChange={(e) => handleInputChange('tieu_chuan_id', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
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

              {/* Ngày dự kiến */}
              <div className="space-y-2">
                <Label htmlFor="ngay_du_kien">
                  Ngày dự kiến <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ngay_du_kien"
                  type="date"
                  value={formData.ngay_du_kien}
                  onChange={(e) => handleInputChange('ngay_du_kien', e.target.value)}
                  required
                />
              </div>

              {/* Ngày thực tế */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ngay_bat_dau_thuc_te">Ngày bắt đầu thực tế</Label>
                  <Input
                    id="ngay_bat_dau_thuc_te"
                    type="date"
                    value={formData.ngay_bat_dau_thuc_te}
                    onChange={(e) => handleInputChange('ngay_bat_dau_thuc_te', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ngay_ket_thuc_thuc_te">Ngày kết thúc thực tế</Label>
                  <Input
                    id="ngay_ket_thuc_thuc_te"
                    type="date"
                    value={formData.ngay_ket_thuc_thuc_te}
                    onChange={(e) => handleInputChange('ngay_ket_thuc_thuc_te', e.target.value)}
                  />
                </div>
              </div>

              {/* Auditor và Tổ chức */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="auditor">Auditor</Label>
                  <select
                    id="auditor"
                    value={formData.auditor}
                    onChange={(e) => handleInputChange('auditor', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="">Chọn auditor...</option>
                    {auditorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to_chuc_danh_gia">Tổ chức đánh giá</Label>
                  <select
                    id="to_chuc_danh_gia"
                    value={formData.to_chuc_danh_gia}
                    onChange={(e) => handleInputChange('to_chuc_danh_gia', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
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

              {/* Trạng thái */}
              <div className="space-y-2">
                <Label htmlFor="trang_thai">Trạng thái</Label>
                <select
                  id="trang_thai"
                  value={formData.trang_thai}
                  onChange={(e) => handleInputChange('trang_thai', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="ke_hoach">Kế hoạch</option>
                  <option value="dang_thuc_hien">Đang thực hiện</option>
                  <option value="hoan_thanh">Hoàn thành</option>
                  <option value="huy_bo">Hủy bỏ</option>
                </select>
              </div>

              {/* Ghi chú */}
              <div className="space-y-2">
                <Label htmlFor="ghi_chu">Ghi chú</Label>
                <Textarea
                  id="ghi_chu"
                  value={formData.ghi_chu}
                  onChange={(e) => handleInputChange('ghi_chu', e.target.value)}
                  placeholder="Ghi chú thêm về lịch đánh giá..."
                  rows={3}
                />
              </div>

              {/* Submit buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Đang cập nhật...' : 'Cập nhật lịch đánh giá'}
                </Button>
                <Link href={`/lich-danh-gia/${lichDanhGiaId}`}>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}