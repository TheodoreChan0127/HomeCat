import { DashboardLayout } from '../ui/components/dashboard/dashboard'

function HomePage() {
  return (
    <DashboardLayout> {/* 包裹页面内容 */}
      <div className="p-4">
        <h1 className="text-xl font-semibold">数据概览</h1>
        {/* 首页具体内容 */}
      </div>
    </DashboardLayout>
  )
}

export default HomePage