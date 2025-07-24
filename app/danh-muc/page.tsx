'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FileText, BookOpen, CheckSquare } from 'lucide-react'
import Link from 'next/link'

const danhMucItems = [
  {
    title: 'Loại tài liệu',
    description: 'Quản lý các loại tài liệu trong hệ thống',
    icon: FileText,
    href: '/danh-muc/loai-tai-lieu',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    title: 'Tiêu chuẩn',
    description: 'Quản lý các tiêu chuẩn áp dụng cho tài liệu',
    icon: BookOpen,
    href: '/danh-muc/tieu-chuan',
    color: 'bg-green-100 text-green-800'
  },
  {
    title: 'Trạng thái',
    description: 'Quản lý các trạng thái của tài liệu',
    icon: CheckSquare,
    href: '/danh-muc/trang-thai',
    color: 'bg-purple-100 text-purple-800'
  }
]

export default function DanhMucPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-gray-600 mt-2">Quản lý các danh mục trong hệ thống</p>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {danhMucItems.map((item) => (
              <Link key={item.title} href={item.href} className="block">
                <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}