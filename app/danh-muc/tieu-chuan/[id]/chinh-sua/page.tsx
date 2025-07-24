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
  ten_tieu_chuan: z.string().min(1, 'Tên tiêu chuẩn là bắt buộc'),
  mo_ta: z.string().optional(),
  tinh_trang: z.enum(['hieu_luc', 'cho_duyet', 'het_hieu_luc']),
})

type FormData = z.infer<typeof formSchema>

interface TieuChuan {
  id: string
  ten_tieu_chuan: string
  mo_ta: string | null
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
}

export default function ChinhSuaTieuChuanPage() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [originalName, setOriginalName] = useState('')
  
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const supabase = createSupabaseClient()
  const tieuChuanId = params.id as string

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ten_tieu_chuan: '',
      mo_ta: '',
      tinh_trang: 'hieu_luc',
    }
  })

  useEffect(() => {
    if (tieuChuanId) {
      fetchTieuChuan()
    }
  }, [tieuChuanId])

  const fetchTieuChuan = async () => {
    try {
      setInitialLoading(true)
      const { data, error } = await supabase
        .from('tieu_chuan')
        .select('*')
        .eq('id', tieuChuanId)
        .single()

      if (error) throw error

      const tieuChuan = data as TieuChuan
      form.reset({
        ten_tieu_chuan: tieuChuan.ten_tieu_chuan,
        mo_ta: tieuChuan.mo_ta || '',
        tinh_trang: tieuChuan.tinh_trang,
      })
      
      setOriginalName(tieuChuan.ten_tieu_chuan)
    } catch (error) {
      console.error('Lỗi khi tải thông tin tiêu chuẩn:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin tiêu chuẩn",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      // Kiểm tra tên tiêu chuẩn đã tồn tại chưa (nếu tên thay đổi)
      if (data.ten_tieu_chuan !== originalName) {
        const { data: existingStandard } = await supabase
          .from('tieu_chuan')
          .select('id')
          .eq('ten_tieu_chuan', data.ten_tieu_chuan)
          .single()

        if (existingStandard) {
          form.setError('ten_tieu_chuan', { 
            type: 'manual', 
            message: 'Tên tiêu chuẩn này đã tồn tại' 
          })
          setLoading(false)
          return
        }
      }

      // Cập nhật thông tin tiêu chuẩn
      const { error } = await supabase
        .from('tieu_chuan')
        .update({
          ten_tieu_chuan: data.ten_tieu_chuan,
          mo_ta: data.mo_ta || null,
          tinh_trang: data.tinh_trang
        })
        .eq('id', tieuChuanId)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin tiêu chuẩn thành công",
      })

      router.push('/danh-muc/tieu-chuan')
    } catch (error) {
      console.error('Lỗi khi cập nhật tiêu chuẩn:', error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin tiêu chuẩn",
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
        <Link href="/danh-muc/tieu-chuan">
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Tiêu chuẩn</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin tiêu chuẩn</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin Tiêu chuẩn</CardTitle>
          <CardDescription>
            Vui lòng điền đầy đủ thông tin bắt buộc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ten_tieu_chuan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tiêu chuẩn *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên tiêu chuẩn" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tên tiêu chuẩn phải là duy nhất trong hệ thống
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
                        placeholder="Nhập mô tả cho tiêu chuẩn này"
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
                      Trạng thái hiện tại của tiêu chuẩn
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
                <Link href="/danh-muc/tieu-chuan">
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