'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/lib/toast'
import { createSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  ho_ten: z.string().min(1, 'Họ tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
  vai_tro: z.enum(['quan_tri', 'phe_duyet', 'nguoi_dung']),
})

type FormData = z.infer<typeof formSchema>

const vaiTroOptions = [
  { value: 'quan_tri', label: 'Quản trị viên' },
  { value: 'phe_duyet', label: 'Người phê duyệt' },
  { value: 'nguoi_dung', label: 'Người dùng' }
]

interface NguoiDung {
  id: string
  ho_ten: string
  email: string
  vai_tro: 'quan_tri' | 'phe_duyet' | 'nguoi_dung'
}

export default function ChinhSuaNguoiDungPage() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [originalEmail, setOriginalEmail] = useState('')
  
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const supabase = createSupabaseClient()
  const userId = params.id as string

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ho_ten: '',
      email: '',
      vai_tro: 'nguoi_dung',
    }
  })

  useEffect(() => {
    if (userId) {
      fetchNguoiDung()
    }
  }, [userId])

  const fetchNguoiDung = async () => {
    try {
      setInitialLoading(true)
      const { data, error } = await supabase
        .from('nguoi_dung')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      const nguoiDung = data as NguoiDung
      form.reset({
        ho_ten: nguoiDung.ho_ten,
        email: nguoiDung.email,
        vai_tro: nguoiDung.vai_tro,
      })
      
      setOriginalEmail(nguoiDung.email)
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      // Kiểm tra email đã tồn tại chưa (nếu email thay đổi)
      if (data.email !== originalEmail) {
        const { data: existingUser } = await supabase
          .from('nguoi_dung')
          .select('id')
          .eq('email', data.email)
          .single()

        if (existingUser) {
          form.setError('email', { 
            type: 'manual', 
            message: 'Email này đã được sử dụng' 
          })
          setLoading(false)
          return
        }
      }

      // Cập nhật thông tin người dùng
      const { error } = await supabase
        .from('nguoi_dung')
        .update({
          ho_ten: data.ho_ten,
          email: data.email,
          vai_tro: data.vai_tro,
        })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin người dùng thành công",
      })

      router.push('/nguoi-dung')
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin người dùng",
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
        <Link href="/nguoi-dung">
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Người dùng</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin người dùng</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin Người dùng</CardTitle>
          <CardDescription>
            Vui lòng điền đầy đủ thông tin bắt buộc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ho_ten"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ tên" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@company.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Email sẽ được sử dụng để đăng nhập
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vai_tro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vaiTroOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Quyền hạn của người dùng trong hệ thống
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
                <Link href="/nguoi-dung">
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