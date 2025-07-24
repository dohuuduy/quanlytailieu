'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileText, Edit, CheckCircle, AlertTriangle, User, Clock } from 'lucide-react'

interface Activity {
  id: string
  type: 'create' | 'update' | 'approve' | 'expire'
  user: string
  document: string
  time: string
  description: string
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'create',
    user: 'Nguyễn Văn A',
    document: 'QT-001',
    time: '2 phút trước',
    description: 'đã tạo tài liệu "Quy trình Kiểm soát Chất lượng"'
  },
  {
    id: '2',
    type: 'approve',
    user: 'Trần Thị B',
    document: 'HD-002',
    time: '15 phút trước',
    description: 'đã phê duyệt tài liệu "Hướng dẫn An toàn Thực phẩm"'
  },
  {
    id: '3',
    type: 'update',
    user: 'Lê Văn C',
    document: 'CS-003',
    time: '1 giờ trước',
    description: 'đã cập nhật tài liệu "Chính sách Bảo mật Thông tin"'
  },
  {
    id: '4',
    type: 'expire',
    user: 'Hệ thống',
    document: 'BM-004',
    time: '2 giờ trước',
    description: 'Tài liệu "Biểu mẫu Đánh giá Nhà cung cấp" sắp hết hạn'
  },
  {
    id: '5',
    type: 'create',
    user: 'Phạm Thị D',
    document: 'BC-005',
    time: '3 giờ trước',
    description: 'đã tạo tài liệu "Báo cáo Tuân thủ ISO 9001"'
  }
]

const activityIcons = {
  create: FileText,
  update: Edit,
  approve: CheckCircle,
  expire: AlertTriangle
}

const activityColors = {
  create: 'text-blue-600',
  update: 'text-yellow-600',
  approve: 'text-green-600',
  expire: 'text-red-600'
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>
          Theo dõi các thay đổi và hoạt động trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const Icon = activityIcons[activity.type]
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ${activityColors[activity.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {activity.user === 'Hệ thống' ? 'SYS' : getInitials(activity.user)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">
                      {activity.user}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.document}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}