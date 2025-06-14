import { Select, Card } from 'antd'
import React, { useState } from 'react'
import DashboardLayout from '../components/dashboard'
import { AnalysisData } from '../Types/analysis'
import { WeightAnalysis } from '../components/analysis/WeightAnalysis'
import { FinanceAnalysis } from '../components/analysis/FinanceAnalysis'
import PageTitle from '../components/PageTitle'

const { Option } = Select

function DataAnalysis() {
  const [selectedType, setSelectedType] = useState<string>('weight')
  const [analysisData] = useState<AnalysisData>({
    type: 'weight',
    timeRange: 'month',
    data: []
  })

  const renderAnalysisModule = () => {
    switch (selectedType) {
      case 'weight':
        return <WeightAnalysis data={analysisData} />
      case 'finance':
        return <FinanceAnalysis data={analysisData} />
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <PageTitle 
          title="数据分析" 
          subtitle="查看猫咪的各项数据统计和分析"
        />
        
        <Card 
          className="hover:shadow-md transition-shadow duration-300"
          styles= {{body: { padding: '24px' }}}
        >
          <div className="flex justify-between items-center mb-6">
            <Select 
              defaultValue="weight"
              style={{ width: 200 }}
              value={selectedType}
              onChange={setSelectedType}
              className="analysis-select"
            >
              <Option value="weight">体重趋势</Option>
              <Option value="finance">财务分析</Option>
            </Select>
          </div>
          <div className="analysis-content">
            {renderAnalysisModule()}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default DataAnalysis