import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { NewDocumentsTable } from '@/components/dashboard/new-documents-table'
import { ExpiringDocumentsTable } from '@/components/dashboard/expiring-documents-table'
import { EvaluationScheduleTable } from '@/components/dashboard/evaluation-schedule-table'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 line-clamp-2">
              Chào mừng bạn đến với hệ thống quản lý hồ sơ tài liệu doanh nghiệp
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content - Document Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* New Documents */}
          <NewDocumentsTable />
          
          {/* Expiring Documents */}
          <ExpiringDocumentsTable />
        </div>

        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Evaluation Schedule */}
          <EvaluationScheduleTable />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardLayout>
  )
}