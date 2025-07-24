'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  ten_loai: z.string().min(1, 'Tên loại tài liệu là bắt buộc'),
  mo_ta: z.string().optional(),
  tinh_trang: z.enum(['hieu_luc', 'cho_duyet', 'het_hieu_luc']),
})

type FormData = z.infer<typeof formSchema>

interface LoaiTaiLieu {
  id: string
  ten_loai: string
  mo_ta: string | null
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
}

export default function ChinhSuaLoaiTaiLieuPage() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [originalName, setOriginalName] = useState('')
  
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const supabase = createSupabaseClient()
  const loaiTaiLieuId = params.id as string

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ten_loai: '',
      mo_ta: '',
      tinh_trang: 'hieu_luc',
    }
  })

  useEffect(() => {
    if (loaiTaiLieuId) {
      fetchLoaiTaiLieu()
    }
  }, [loaiTaiLieuId])

  const fetchLoaiTaiLieu = async () => {
    try {
      setInitialLoading(true)
      const { data, error } = await supabase
        .from('loai_tai_lieu')
        .select('*')
        .eq('id', loaiTaiLieuId)
        .single()

      if (error) throw error

      const loaiTaiLieu = data as LoaiTaiLieu
      form.reset({
        ten_loai: loaiTaiLieu.ten_loai,
        mo_ta: loaiTaiLieu.mo_ta || '',
        tinh_trang: loaiTaiLieu.tinh_trang,
      })
      
      setOriginalName(loaiTaiLieu.ten_loai)
    } catch (error) {
      console.error('Lỗi khi tải thông tin loại tài liệu:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin loại tài liệu",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      // Kiểm tra tên loại tài liệu đã tồn tại chưa (nếu tên thay đổi)
      if (data.ten_loai !== originalName) {
        const { data: existingType } = await supabase
          .from('loai_tai_lieu')
          .select('id')
          .eq('ten_loai', data.ten_loai)
          .single()

        if (existingType) {
          form.setError('ten_loai', { 
            type: 'manual', 
            message: 'Tên loại tài liệu này đã tồn tại' 
          })
          setLoading(false)
          return
        }
      }

      // Cập nhật thông tin loại tài liệu
      const { error } = await supabase
        .from('loai_tai_lieu')
        .update({
          ten_loai: data.ten_loai,
          mo_ta: data.mo_ta || null,
          tinh_trang: data.tinh_trang
        })
        .eq('id', loaiTaiLieuId)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin loại tài liệu thành công",
      })

      router.push('/danh-muc/loai-tai-lieu')
    } catch (error) {
      console.error('Lỗi khi cập nhật loại tài liệu:', error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin loại tài liệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
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
      <div className="flex items-center gap-4 mb-6">
        <Link href="/danh-muc/loai-tai-lieu">
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Loại tài liệu</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin loại tài liệu</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin Loại tài liệu</CardTitle>
          <CardDescription>
            Vui lòng điền đầy đủ thông tin bắt buộc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ten_loai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên loại tài liệu *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên loại tài liệu" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tên loại tài liệu phải là duy nhất trong hệ thống
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mo_ta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Nhập mô tả cho loại tài liệu này"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tinh_trang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tình trạng *</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...field}
                      >
                        <option value="hieu_luc">Hiệu lực</option>
                        <option value="cho_duyet">Chờ duyệt</option>
                        <option value="het_hieu_luc">Hết hiệu lực</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Trạng thái hiện tại của loại tài liệu
                    </FormDescription>
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
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
                <Link href="/danh-muc/loai-tai-lieu">
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