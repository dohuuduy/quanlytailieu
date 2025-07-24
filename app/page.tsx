import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentDocuments } from '@/components/dashboard/recent-documents'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Chào mừng bạn đến với hệ thống quản lý hồ sơ tài liệu doanh nghiệp
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Documents */}
          <div className="lg:col-span-2">
            <RecentDocuments />
          </div>

          {/* Right Column - Activity Feed */}
          <div>
            <ActivityFeed />
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardLayout>
  )
}