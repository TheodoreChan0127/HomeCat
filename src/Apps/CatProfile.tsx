import { Button, Card, Input, message, Select, Space} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { JSX } from 'react/jsx-runtime'
import React,{ useState, useCallback, useEffect } from 'react'
import { DashboardLayout } from '../components/dashboard'
import { Cat } from '../entity/Cat'
import { CatDbProxy } from '../db/CatDbProxy'
import AddCatModal from '../components/AddCatModal'
import { clearBreeds, getBreeds } from '../config/breeds'
import CatDetailModal from '../components/CatDetailModal'
import PetStatusModal from '../components/PetStatusModal'


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
    clearBreeds();

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
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddCat}
            >添加猫咪</Button>
            
            {/* 新增清除按钮 */}
            <Button 
              type="primary" 
              danger
              onClick={handleClearAll}
            >一键清空数据</Button>
          </Space>
        </Card>

        {/* 猫咪卡片列表 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
        <div>
        {currentCats.map((cat) => (
          <div key={cat.id} style={{ padding: '8px' }}>
            <Card hoverable>
            <div className="flex items-center h-full p-4"> 
              <div className="flex-grow" onClick={() => { 
                setSelectedCat(cat) 
                setIsDetailModalVisible(true) 
              }}> 
                <h3 className="text-lg font-medium">{cat.name}</h3> 
                <p className="text-gray-600">{cat.breed} · {cat.age}岁</p> 
              </div> 
              <Button 
                type="primary" 
                className="ml-auto whitespace-nowrap"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSelectedCat(cat); 
                  setIsStatusModalVisible(true); 
                }} 
              > 
                查看状态 
              </Button> 
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