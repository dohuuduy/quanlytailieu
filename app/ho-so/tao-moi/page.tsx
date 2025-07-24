'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  ma_tai_lieu: z.string().min(1, 'Mã tài liệu là bắt buộc'),
  ten_tai_lieu: z.string().min(1, 'Tên tài liệu là bắt buộc'),
  phien_ban: z.string().min(1, 'Phiên bản là bắt buộc'),
  ngay_ban_hanh: z.string().min(1, 'Ngày ban hành là bắt buộc'),
  ngay_het_hieu_luc: z.string().optional(),
  loai_tai_lieu_id: z.string().min(1, 'Loại tài liệu là bắt buộc'),
  nguoi_ban_hanh_id: z.string().min(1, 'Người ban hành là bắt buộc'),
  tinh_trang: z.enum(['hieu_luc', 'cho_duyet', 'het_hieu_luc']),
  ghi_chu: z.string().optional(),
  tieu_chuan_ids: z.array(z.string()).optional()
})

type FormData = z.infer<typeof formSchema>

interface LoaiTaiLieu {
  id: string
  ten_loai: string
}

interface NguoiDung {
  id: string
  ho_ten: string
}

interface TieuChuan {
  id: string
  ten_tieu_chuan: string
}

export default function TaoMoiHoSoPage() {
  const [loading, setLoading] = useState(false)
  const [loaiTaiLieuList, setLoaiTaiLieuList] = useState<LoaiTaiLieu[]>([])
  const [nguoiDungList, setNguoiDungList] = useState<NguoiDung[]>([])
  const [tieuChuanList, setTieuChuanList] = useState<TieuChuan[]>([])
  const [selectedTieuChuan, setSelectedTieuChuan] = useState<string[]>([])
  
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ma_tai_lieu: '',
      ten_tai_lieu: '',
      phien_ban: 'v1.0',
      ngay_ban_hanh: new Date().toISOString().split('T')[0],
      ngay_het_hieu_luc: '',
      loai_tai_lieu_id: '',
      nguoi_ban_hanh_id: '',
      tinh_trang: 'cho_duyet',
      ghi_chu: '',
      tieu_chuan_ids: []
    }
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      // Fetch loại tài liệu
      const { data: loaiTaiLieu, error: loaiError } = await supabase
        .from('loai_tai_lieu')
        .select('id, ten_loai')
        .order('ten_loai')

      if (loaiError) {
        console.error('Lỗi loai_tai_lieu:', loaiError)
        setLoaiTaiLieuList([])
      } else {
        setLoaiTaiLieuList(loaiTaiLieu || [])
      }

      // Fetch người dùng
      const { data: nguoiDung, error: nguoiError } = await supabase
        .from('nguoi_dung')
        .select('id, ho_ten')
        .order('ho_ten')

      if (nguoiError) {
        console.error('Lỗi nguoi_dung:', nguoiError)
        setNguoiDungList([])
      } else {
        setNguoiDungList(nguoiDung || [])
      }

      // Fetch tiêu chuẩn
      const { data: tieuChuan, error: tieuError } = await supabase
        .from('tieu_chuan')
        .select('id, ten_tieu_chuan')
        .order('ten_tieu_chuan')

      if (tieuError) {
        console.error('Lỗi tieu_chuan:', tieuError)
        setTieuChuanList([])
      } else {
        setTieuChuanList(tieuChuan || [])
      }

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      toast({
        title: "Lỗi kết nối",
        description: "Vui lòng kiểm tra kết nối database và thử lại",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      // Tạo hồ sơ mới
      const { data: hoSo, error: hoSoError } = await supabase
        .from('ho_so')
        .insert({
          ma_tai_lieu: data.ma_tai_lieu,
          ten_tai_lieu: data.ten_tai_lieu,
          phien_ban: data.phien_ban,
          ngay_ban_hanh: data.ngay_ban_hanh,
          ngay_het_hieu_luc: data.ngay_het_hieu_luc || null,
          loai_tai_lieu_id: data.loai_tai_lieu_id,
          nguoi_ban_hanh_id: data.nguoi_ban_hanh_id,
          tinh_trang: data.tinh_trang,
          ghi_chu: data.ghi_chu || null
        })
        .select()
        .single()

      if (hoSoError) throw hoSoError

      // Thêm liên kết với tiêu chuẩn nếu có
      if (selectedTieuChuan.length > 0) {
        const tieuChuanLinks = selectedTieuChuan.map(tieuChuanId => ({
          ho_so_id: hoSo.id,
          tieu_chuan_id: tieuChuanId
        }))

        const { error: linkError } = await supabase
          .from('tai_lieu_tieu_chuan')
          .insert(tieuChuanLinks)

        if (linkError) throw linkError
      }

      toast({
        title: "Thành công",
        description: "Đã tạo hồ sơ tài liệu thành công",
      })

      router.push('/ho-so')
    } catch (error) {
      console.error('Lỗi khi tạo hồ sơ:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo hồ sơ tài liệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleTieuChuan = (tieuChuanId: string) => {
    setSelectedTieuChuan(prev => 
      prev.includes(tieuChuanId)
        ? prev.filter(id => id !== tieuChuanId)
        : [...prev, tieuChuanId]
    )
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ho-so">
          <Button variant="outline" size="sm" className="h-10 px-4 font-medium hover:bg-accent/80 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo mới Hồ sơ Tài liệu</h1>
          <p className="text-gray-600 mt-1">Nhập thông tin để tạo hồ sơ tài liệu mới</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Thông tin Hồ sơ</CardTitle>
          <CardDescription>
            Vui lòng điền đầy đủ thông tin bắt buộc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ma_tai_lieu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã tài liệu *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: QT-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Mã định danh duy nhất cho tài liệu
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phien_ban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phiên bản *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: v1.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ten_tai_lieu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tài liệu *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên tài liệu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ngay_ban_hanh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày ban hành *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ngay_het_hieu_luc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày hết hiệu lực</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Để trống nếu không có ngày hết hạn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="loai_tai_lieu_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại tài liệu *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại tài liệu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loaiTaiLieuList.map((loai) => (
                            <SelectItem key={loai.id} value={loai.id}>
                              {loai.ten_loai}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nguoi_ban_hanh_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người ban hành *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn người ban hành" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nguoiDungList.map((nguoi) => (
                            <SelectItem key={nguoi.id} value={nguoi.id}>
                              {nguoi.ho_ten}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tinh_trang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tình trạng *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tình trạng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cho_duyet">Chờ duyệt</SelectItem>
                        <SelectItem value="hieu_luc">Hiệu lực</SelectItem>
                        <SelectItem value="het_hieu_luc">Hết hiệu lực</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tiêu chuẩn áp dụng */}
              <div className="space-y-3">
                <Label>Tiêu chuẩn áp dụng</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tieuChuanList.map((tieuChuan) => (
                    <div key={tieuChuan.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={tieuChuan.id}
                        checked={selectedTieuChuan.includes(tieuChuan.id)}
                        onChange={() => toggleTieuChuan(tieuChuan.id)}
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={tieuChuan.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {tieuChuan.ten_tieu_chuan}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="ghi_chu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Nhập ghi chú (nếu có)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-10 px-4 font-medium"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </Button>
                <Link href="/ho-so">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="h-10 px-4 font-medium hover:bg-accent/80 transition-colors"
                  >
                    Hủy bỏ
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}