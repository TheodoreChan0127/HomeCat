import { Button, Card, Input, Select, Space} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { JSX } from 'react/jsx-runtime'
import React,{ useState, useCallback, useEffect } from 'react'
import { DashboardLayout } from '../components/dashboard'
import { Cat } from '../entity/Cat'
import { CatDbProxy } from '../db/CatDbProxy'
import AddCatModal from '../components/AddCatModal'
import { getBreeds } from '../config/breeds'

// Remove unused CatProfileProps interface
// interface CatProfileProps {} // Remove this line

function CatProfile(): JSX.Element {
    // 通过CatDbProxy获取猫咪数据
  const [catsData,  setCatsData] = useState<{ data: Cat[]; total: number; totalPages: number }>({ data: [], total: 0, totalPages: 1 })
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = catsData.totalPages
  // 当前页数据
  const currentCats = catsData.data
  // 筛选状态
  const [breeds, setBreeds] = useState<string[]>([])
  const [filters, setFilters] = useState({    name: '',    breed: '',    isPregnant: undefined,    isSick: undefined,    isVaccinated: undefined,    isDewormed: undefined  })

  // 加载品种数据
  useEffect(() => {
    const loadBreeds = async () => {
      const breedList = getBreeds()
      setBreeds(breedList)
    }
    loadBreeds()
  }, [])

  // 获取猫咪列表
  const fetchCats = useCallback(async () => {
    const result = await CatDbProxy.getCats({ currentPage, itemsPerPage, filters })
    setCatsData(result)
  }, [currentPage, itemsPerPage, filters])

  // 控制添加模态框显示状态
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)

  // 触发显示添加模态框
  const handleAddCat = useCallback(() => {
    setIsAddModalVisible(true)
  }, [])

  useEffect(() => {
    fetchCats()
  }, [fetchCats])



  return (
    <DashboardLayout>
      {<AddCatModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSuccess={fetchCats}
      />}
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
              options={breeds.map(breed => ({ value: breed, label: breed }))}
              value={filters.breed}
              onChange={(value) => setFilters({...filters, breed: value})}
            />
            <Button onClick={() => {
              setFilters({ name: '', breed: '', isPregnant: undefined, isSick: undefined, isVaccinated: undefined, isDewormed: undefined })
              fetchCats()
            }}>清空筛选</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCat}>添加猫咪</Button>
          </Space>
        </Card>

        {/* 猫咪卡片列表 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
  <div>
    {currentCats.map((cat) => (
      <div key={cat.id} style={{ padding: '8px' }}>
        <Card hoverable onClick={() => setIsAddModalVisible(true)}>
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