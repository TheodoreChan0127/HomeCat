import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import React from 'react'

const { Sider, Content } = Layout

// 定义布局组件 Props 类型（新增）
interface DashboardLayoutProps {
  children: React.ReactNode // 允许子组件内容
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathToKey = {
    '/': '0',
    '/cat-profile': '1',
    '/daily-records': '2',
    '/reminder-settings': '3',
    '/data-analysis': '4'
  }
  const currentKey = pathToKey[location.pathname] || '0'
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <Layout className="h-screen">
      {/* 左侧导航栏（保持原有逻辑） */}
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} style={{ height: '100vh', position: 'fixed' }} theme="light">
        <Menu
  theme="light"
  mode="inline"
  selectedKeys={[currentKey]}
  style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', alignItems: 'center' }}
  items={[
    { key: '0', label: '回到首页', onClick: () => navigate('/') },
    { key: '1', label: '猫咪档案', onClick: () => navigate('/cat-profile') },
    { key: '2', label: '日常记录', onClick: () => navigate('/daily-records') },
    { key: '3', label: '提醒设置', onClick: () => navigate('/reminder-settings') },
    { key: '4', label: '数据分析', onClick: () => navigate('/data-analysis') }
  ]}
/>
      </Sider>

      {/* 右侧内容区（渲染子组件） */}
      <Layout className="flex flex-col" style={{ marginLeft: collapsed ? '80px' : '200px' }}>
        <Content className="flex-1 p-4 overflow-auto">
          {children} {/* 渲染子组件内容 */}
        </Content>
      </Layout>
    </Layout>
  )
}