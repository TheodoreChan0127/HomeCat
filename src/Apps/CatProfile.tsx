import { Button, Card, Input, message, Select, Space, Tag } from 'antd'
import { PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import { JSX } from 'react/jsx-runtime'
import React,{ useState, useCallback, useEffect } from 'react'
import DashboardLayout from '../components/dashboard'
import { Cat } from '../entity/Cat'
import { CatDbProxy } from '../db/CatDbProxy'
import AddCatModal from '../components/AddCatModal'
import CatDetailModal from '../components/CatDetailModal'
import PetStatusModal from '../components/PetStatusModal'
import PageTitle from '../components/PageTitle'
import { getBreeds } from '../config/breedSettings'


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
  const [messageApi, contextHolder] = message.useMessage();
  // 控制添加模态框显示状态
const [selectedCat, setSelectedCat] = useState<Cat | null>(null)
const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
const [isAddModalVisible, setIsAddModalVisible] = useState(false)
const [isStatusModalVisible, setIsStatusModalVisible] = useState(false)

// 在fetchCats方法中添加错误处理
const fetchCats = useCallback(async () => {
  try {
    const result = await CatDbProxy.getCats({ currentPage, itemsPerPage, filters });
    setCatsData(result);
  } catch (error) {
    console.error('获取数据失败:', error);
    
  }
}, [currentPage, itemsPerPage, filters]);

const loadBreeds = () => {
  try {
    setBreeds(getBreeds())
  } catch (error) {
    console.error('加载品种失败:', error);
  }
};

// 新增清除全部数据的方法
// 修改handleClearAll方法
const handleClearAll = useCallback(async () => {
  try {
    await CatDbProxy.deleteAll();
    // 重置分页和筛选状态
    setCurrentPage(1);
    setFilters({
      name: '',
      breed: '',
      isPregnant: undefined,
      isSick: undefined,
      isVaccinated: undefined,
      isDewormed: undefined
    });
    // 强制刷新数据
    await fetchCats();
    loadBreeds();
    messageApi.open({
      type: 'success',
      content: '所有猫咪数据已清空',
    });
  } catch (error) {
    console.error('清空失败:', error);
    message.error(`清空失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}, [fetchCats]);


  // 触发显示添加模态框
  const handleAddCat = useCallback(() => {
    setIsAddModalVisible(true)
  }, [])

  useEffect(() => {
    fetchCats()
  }, [fetchCats])

  // 加载品种数据
  useEffect(loadBreeds, [])

  return (
    <DashboardLayout>
      {contextHolder}
      {<CatDetailModal
        visible={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false)
          setSelectedCat(null)
        }}
        cat={selectedCat}
        onSuccess={fetchCats}
      />}
      {<AddCatModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSuccess={fetchCats}
      />}
      <PetStatusModal
      visible={isStatusModalVisible}
      onCancel={() => {
        setIsStatusModalVisible(false)
        setSelectedCat(null)
      }}
      cat={selectedCat}
      />
      <div className="h-screen flex flex-col">
        <div className="p-6 max-w-6xl mx-auto flex-1 w-full flex flex-col">
          <PageTitle 
            title="猫咪管理" 
            subtitle="管理所有猫咪的信息和状态"
            icon={<TeamOutlined />}
          />

          {/* 顶部筛选栏 */}
          <Card 
            className="mb-6 hover:shadow-md transition-shadow duration-300"
            styles ={{ body: { padding: '16px' } }}
          >
            <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space size="middle">
                <Input 
                  placeholder="搜索猫咪名称" 
                  prefix={<SearchOutlined />} 
                  value={filters.name}
                  onChange={(e) => setFilters({...filters, name: e.target.value})}
                  style={{ width: 200 }}
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
              </Space>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddCat}
                >
                  添加猫咪
                </Button>
                <Button 
                  type="primary" 
                  danger
                  onClick={handleClearAll}
                >
                  一键清空数据
                </Button>
              </Space>
            </Space>
          </Card>

          {/* 猫咪卡片列表 */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentCats.map((cat) => (
                <Card 
                  key={cat.id} 
                  hoverable
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex flex-col p-4"> 
                    <div className="flex items-center justify-between mb-3"> 
                      <div 
                        className="flex-grow cursor-pointer" 
                        onClick={() => { 
                          setSelectedCat(cat) 
                          setIsDetailModalVisible(true) 
                        }}
                      > 
                        <h3 className="text-lg font-medium mb-1">{cat.name}</h3> 
                        <p className="text-gray-600 text-sm">{cat.breed} · {cat.age}岁</p> 
                      </div> 
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedCat(cat); 
                          setIsStatusModalVisible(true); 
                        }} 
                      > 
                        查看状态 
                      </Button> 
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Tag color={cat.isPregnant ? "red" : "default"}>
                        {cat.isPregnant ? "怀孕中" : "未怀孕"}
                      </Tag>
                      <Tag color={cat.isSick ? "orange" : "default"}>
                        {cat.isSick ? "生病中" : "健康"}
                      </Tag>
                      <Tag color={cat.isVaccinated ? "green" : "default"}>
                        {cat.isVaccinated ? "已接种疫苗" : "未接种疫苗"}
                      </Tag>
                      <Tag color={cat.isDewormed ? "blue" : "default"}>
                        {cat.isDewormed ? "已驱虫" : "未驱虫"}
                      </Tag>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 分页控件 - 固定在底部 */}
          <Card 
            className="mt-6 bg-white shadow-md"
            styles={{body:{ padding: '12px' }}}
          >
            <Space className="w-full flex justify-center" size="middle" align='center'>
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
      </div>
    </DashboardLayout>
  )
}

export default CatProfile