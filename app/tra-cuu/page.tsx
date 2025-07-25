'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { FileText, Search, Filter, BookOpen, Users, Building } from 'lucide-react'
import Link from 'next/link'

const traCuuOptions = [
  {
    id: 'tieu-chuan',
    title: 'Tra cứu theo Tiêu chuẩn',
    description: 'Tìm kiếm tài liệu theo các tiêu chuẩn như BRC v9, ISO 9001, SMETA...',
    icon: BookOpen,
    href: '/tra-cuu/tieu-chuan',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    features: [
      'Lọc theo tiêu chuẩn cụ thể',
      'Hiển thị đầy đủ thông tin tài liệu',
      'Xuất PDF, sao chép, in ấn',
      'Sắp xếp và phân trang'
    ]
  },
  {
    id: 'loai-tai-lieu',
    title: 'Tra cứu theo Loại tài liệu',
    description: 'Tìm kiếm tài liệu theo loại như Quy trình, Hướng dẫn, Biểu mẫu...',
    icon: FileText,
    href: '/tra-cuu/loai-tai-lieu',
    color: 'bg-green-100 text-green-800 border-green-200',
    features: [
      'Phân loại tài liệu rõ ràng',
      'Tìm kiếm nhanh chóng',
      'Lọc theo tình trạng',
      'Xuất báo cáo chi tiết'
    ]
  },
  {
    id: 'nguoi-ban-hanh',
    title: 'Tra cứu theo Người ban hành',
    description: 'Tìm kiếm tài liệu theo người ban hành hoặc phê duyệt',
    icon: Users,
    href: '/tra-cuu/nguoi-ban-hanh',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    features: [
      'Theo dõi tài liệu theo người',
      'Thống kê hiệu suất',
      'Lịch sử ban hành',
      'Báo cáo tổng hợp'
    ]
  },
  {
    id: 'tim-kiem-nang-cao',
    title: 'Tìm kiếm nâng cao',
    description: 'Tìm kiếm tài liệu với nhiều tiêu chí kết hợp',
    icon: Search,
    href: '/tra-cuu/tim-kiem-nang-cao',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    features: [
      'Tìm kiếm đa tiêu chí',
      'Lọc theo khoảng thời gian',
      'Tìm kiếm full-text',
      'Lưu bộ lọc thường dùng'
    ]
  }
]

export default function TraCuuPage() {
  return (
    <DashboardLayout>
      <div className="space-y-0">
        {/* Page Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tra cứu Tài liệu</h1>
              <p className="text-gray-600 mt-2">
                Tìm kiếm và tra cứu tài liệu theo nhiều tiêu chí khác nhau
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {traCuuOptions.map((option) => (
              <Card key={option.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${option.color}`}>
                      <option.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {option.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Tính năng:</h4>
                      <ul className="space-y-1">
                        {option.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link href={option.href}>
                      <Button className="w-full">
                        Bắt đầu tra cứu
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Hướng dẫn sử dụng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-medium text-blue-900">Theo Tiêu chuẩn</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Chọn tiêu chuẩn để xem tài liệu liên quan
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-medium text-green-900">Theo Loại</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Phân loại theo quy trình, hướng dẫn...
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-medium text-purple-900">Theo Người</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Tìm theo người ban hành hoặc phê duyệt
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Search className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-medium text-orange-900">Nâng cao</h3>
                    <p className="text-sm text-orange-700 mt-1">
                      Tìm kiếm với nhiều tiêu chí kết hợp
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}