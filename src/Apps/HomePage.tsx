import React,{ JSX } from "react"
import DashboardLayout from "../components/dashboard"

function HomePage(): JSX.Element {

  return (
    <DashboardLayout> {/* 包裹页面内容 */}
      <div className="p-4">
        <h1 className="text-xl font-semibold">首页</h1>
      </div>
    </DashboardLayout>
  )
}

export default HomePage