import { Select, Button, Card } from 'antd'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardLayout } from '../ui/components/dashboard/dashboard' // 新增布局导入
import { JSX } from 'react/jsx-runtime'

const mockData = [
  { month: '1月', weight: 2.1 },
  { month: '2月', weight: 2.5 },
  { month: '3月', weight: 2.8 },
  { month: '4月', weight: 3.2 }
]

function DataAnalysis(): JSX.Element {
  const { Option } = Select

  return (
    <DashboardLayout> {/* 新增布局包裹 */}
      <div className="p-4">
        <div className="mb-4 flex gap-4">
          <Select placeholder="选择分析类型" style={{ width: 200 }}>
            <Option value="weight">体重趋势</Option>
            <Option value="diet">饮食统计</Option>
          </Select>
          <Select placeholder="选择时间范围" style={{ width: 200 }}>
            <Option value="month">最近3个月</Option>
            <Option value="year">最近1年</Option>
          </Select>
          <Button type="primary">生成图表</Button>
        </div>

        <Card title="体重增长趋势">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#5468ff" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default DataAnalysis