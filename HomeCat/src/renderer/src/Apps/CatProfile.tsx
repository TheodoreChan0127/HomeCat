import { Button, Card, Input, Select, Space} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { DashboardLayout } from '../ui/components/dashboard/dashboard'
import { JSX } from 'react/jsx-runtime'

import { useState, useCallback, useEffect } from 'react'

interface Cat {
  id: number;
  name: string;
  breed: string;
  age: number;
  isPregnant: boolean;
  isSick: boolean;
  isVaccinated: boolean;
  isDewormed: boolean;
}

// Remove unused CatProfileProps interface
// interface CatProfileProps {} // Remove this line

function CatProfile(): JSX.Element {
    // 通过IPC获取猫咪数据
    const [catsData, setCatsData] = useState<{ data: Cat[]; total: number; totalPages: number }>({ data: [], total: 0, totalPages: 1 })
  // 分页状态
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 10
const totalPages = catsData.totalPages
// 当前页数据
const currentCats = catsData.data
  // 筛选状态
  const [filters, setFilters] = useState({
    name: '',
    breed: '',
    isPregnant: false,
    isSick: false,
    isVaccinated: false,
    isDewormed: false
  })

  // 获取猫咪列表
  const fetchCats = useCallback(async () => {
    const result = await CatApi.getCats(currentPage, itemsPerPage, filters)
    setCatsData(result)
  }, [currentPage, itemsPerPage, filters])

  useEffect(() => {
    fetchCats()
  }, [fetchCats])



  return (
    <DashboardLayout>
      <div className="p-4 flex flex-col h-full">
        {/* 顶部筛选栏 */}
        <Card className="mb-4">
          <Space size="middle">
            <Input 
              placeholder="搜索猫咪名称" 
              prefix={<SearchOutlined />} 
              value={filters.name}
              onChange={(e) => setFilters({...filters, name: e.target.value})}
            />
            <Select
              placeholder="品种"
              style={{ width: 120 }}
              options={[
                { value: '英短', label: '英短' },
                { value: '美短', label: '美短' },
                { value: '布偶', label: '布偶' },
                { value: '暹罗', label: '暹罗' }
              ]}
              value={filters.breed}
              onChange={(value) => setFilters({...filters, breed: value})}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={async () => {
  const newCat = {
    name: '新猫咪',
    breed: '英短',
    age: 1,
    isPregnant: false,
    isSick: false,
    isVaccinated: false,
    isDewormed: false
  }
  await CatApi.addCat(newCat)
  fetchCats()
}}>添加猫咪</Button>
          </Space>
        </Card>

        {/* 猫咪卡片列表 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
  <div>
    {currentCats.map((cat) => (
      <div key={cat.id} style={{ padding: '8px' }}>
        <Card hoverable>
          <div>
            <div>
              <h3 className="text-lg font-medium">{cat.name}</h3>
              <p className="text-gray-600">{cat.breed} · {cat.age}岁</p>
            </div>
          </div>
        </Card>
      </div>
    ))}
  </div>
</div>

{/* 分页控件 */}
<Card className="mt-auto flex justify-center items-center">
  <Space className="self-center flex justify-center" size="middle" align='center'>
    <Button 
      disabled={currentPage === 1}
      onClick={async () => {
        setCurrentPage(prev => Math.max(1, prev - 1))
        await fetchCats()
      }}
    >
      上一页
    </Button>
    <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
    <Button 
      disabled={currentPage === totalPages}
      onClick={async () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1))
        await fetchCats()
      }}
    >
      下一页
    </Button>
  </Space>
</Card>
      </div>
    </DashboardLayout>
  )
}

export default CatProfile