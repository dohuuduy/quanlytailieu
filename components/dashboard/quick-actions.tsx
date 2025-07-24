'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Upload, Download, Search, Settings, Users } from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    title: 'Tạo tài liệu mới',
    description: 'Tạo hồ sơ tài liệu mới',
    icon: Plus,
    href: '/ho-so/tao-moi',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    title: 'Tải lên tài liệu',
    description: 'Upload file tài liệu',
    icon: Upload,
    href: '/upload',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    title: 'Xuất báo cáo',
    description: 'Tạo báo cáo tổng hợp',
    icon: Download,
    href: '/bao-cao/xuat',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    title: 'Tìm kiếm nâng cao',
    description: 'Tìm kiếm chi tiết',
    icon: Search,
    href: '/tim-kiem',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    title: 'Quản lý người dùng',
    description: 'Thêm/sửa người dùng',
    icon: Users,
    href: '/nguoi-dung',
    color: 'bg-indigo-500 hover:bg-indigo-600'
  },
  {
    title: 'Cài đặt hệ thống',
    description: 'Cấu hình hệ thống',
    icon: Settings,
    href: '/cai-dat',
    color: 'bg-gray-500 hover:bg-gray-600'
  }
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thao tác nhanh</CardTitle>
        <CardDescription>
          Các chức năng thường dùng để tăng hiệu quả làm việc
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href} className="block">
              <div className="group relative overflow-hidden rounded-lg border p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full min-h-[120px]">
                <div className="flex flex-col items-center text-center space-y-3 h-full justify-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${action.color} transition-all duration-200 group-hover:scale-110 flex-shrink-0`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center space-y-1">
                    <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {action.description}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}