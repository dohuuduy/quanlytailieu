'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye, Edit, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface Document {
  id: string
  ma_tai_lieu: string
  ten_tai_lieu: string
  phien_ban: string
  tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
  ngay_cap_nhat: string
  loai_tai_lieu: string
}

const mockDocuments: Document[] = [
  {
    id: '1',
    ma_tai_lieu: 'QT-001',
    ten_tai_lieu: 'Quy trình Kiểm soát Chất lượng',
    phien_ban: 'v2.1',
    tinh_trang: 'hieu_luc',
    ngay_cap_nhat: '2024-01-15',
    loai_tai_lieu: 'Quy trình'
  },
  {
    id: '2',
    ma_tai_lieu: 'HD-002',
    ten_tai_lieu: 'Hướng dẫn An toàn Thực phẩm',
    phien_ban: 'v1.3',
    tinh_trang: 'cho_duyet',
    ngay_cap_nhat: '2024-01-14',
    loai_tai_lieu: 'Hướng dẫn'
  },
  {
    id: '3',
    ma_tai_lieu: 'CS-003',
    ten_tai_lieu: 'Chính sách Bảo mật Thông tin',
    phien_ban: 'v1.0',
    tinh_trang: 'hieu_luc',
    ngay_cap_nhat: '2024-01-13',
    loai_tai_lieu: 'Chính sách'
  },
  {
    id: '4',
    ma_tai_lieu: 'BM-004',
    ten_tai_lieu: 'Biểu mẫu Đánh giá Nhà cung cấp',
    phien_ban: 'v2.0',
    tinh_trang: 'hieu_luc',
    ngay_cap_nhat: '2024-01-12',
    loai_tai_lieu: 'Biểu mẫu'
  },
  {
    id: '5',
    ma_tai_lieu: 'BC-005',
    ten_tai_lieu: 'Báo cáo Tuân thủ ISO 9001',
    phien_ban: 'v1.1',
    tinh_trang: 'cho_duyet',
    ngay_cap_nhat: '2024-01-11',
    loai_tai_lieu: 'Báo cáo'
  }
]

const statusColors = {
  hieu_luc: 'bg-green-100 text-green-800',
  cho_duyet: 'bg-yellow-100 text-yellow-800',
  het_hieu_luc: 'bg-red-100 text-red-800'
}

const statusLabels = {
  hieu_luc: 'Hiệu lực',
  cho_duyet: 'Chờ duyệt',
  het_hieu_luc: 'Hết hiệu lực'
}

export function RecentDocuments() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tài liệu gần đây</CardTitle>
            <CardDescription>
              Các tài liệu được tạo hoặc cập nhật gần đây
            </CardDescription>
          </div>
          <Link href="/ho-so">
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockDocuments.map((doc) => (
            <ContextMenu key={doc.id}>
              <ContextMenuTrigger>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.ma_tai_lieu}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {doc.phien_ban}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {doc.ten_tai_lieu}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {doc.loai_tai_lieu}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(doc.ngay_cap_nhat).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[doc.tinh_trang]}>
                      {statusLabels[doc.tinh_trang]}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </ContextMenuItem>
                <ContextMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-red-600">
                  Xóa tài liệu
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}