import React,{ JSX, useState, useEffect } from "react"
import { DashboardLayout } from "../components/dashboard"
import { Card } from 'antd'
import { CatDbProxy } from '../db/CatDbProxy'


function HomePage(): JSX.Element {
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchTableCounts = async () => {
      const counts = await CatDbProxy.getTableCounts()
      setTableCounts(counts)
    }
    fetchTableCounts()
  }, [])

  return (
    <DashboardLayout> {/* 包裹页面内容 */}
      <div className="p-4">
        <h1 className="text-xl font-semibold">数据概览</h1>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(tableCounts).map(([table, count]) => (
            <Card key={table} className="shadow-sm">
              <h3 className="text-lg font-medium">{table}</h3>
              <p className="text-gray-600 text-xl">{count} 条记录</p>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default HomePage