'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

const trangThaiItems = [
  {
    id: 'hieu_luc',
    name: 'Hiệu lực',
    description: 'Tài liệu đã được phê duyệt và đang có hiệu lực',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'cho_duyet',
    name: 'Chờ duyệt',
    description: 'Tài liệu đang chờ được phê duyệt',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    id: 'het_hieu_luc',
    name: 'Hết hiệu lực',
    description: 'Tài liệu đã hết hiệu lực hoặc bị hủy bỏ',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200'
  }
]

export default function TrangThaiPage() {
  return (
    <DashboardLayout>
      <div className="space-y-0">
        {/* Page Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Danh mục Trạng thái</h1>
              <p className="text-gray-600 mt-2">Các trạng thái của tài liệu trong hệ thống</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái tài liệu</CardTitle>
              <CardDescription>
                Danh sách các trạng thái được định nghĩa trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trangThaiItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        <Badge variant="outline" className={item.color}>
                          {item.id}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2">Lưu ý</h3>
                <p className="text-sm text-muted-foreground">
                  Các trạng thái này được định nghĩa cứng trong hệ thống và không thể thêm, sửa hoặc xóa. 
                  Mỗi tài liệu trong hệ thống sẽ luôn ở một trong ba trạng thái này.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}