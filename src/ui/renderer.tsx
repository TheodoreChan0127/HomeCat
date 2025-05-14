import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, Layout, Menu, Button } from 'antd'
const { Header, Sider, Content } = Layout

const root = ReactDOM.createRoot(document.getElementById('root')!)

console.log('渲染开始：HomeCat界面渲染启动')
root.render(
  <ConfigProvider>
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible defaultCollapsed={false} onCollapse={(collapsed) => console.log('侧边栏折叠状态变更：', collapsed)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" onClick={() => console.log('选中菜单项：猫咪档案')}>猫咪档案</Menu.Item>
          <Menu.Item key="2" onClick={() => console.log('选中菜单项：日常记录')}>日常记录</Menu.Item>
          <Menu.Item key="3" onClick={() => console.log('选中菜单项：繁殖管理')}>繁殖管理</Menu.Item>
          <Menu.Item key="4" onClick={() => console.log('选中菜单项：数据分析')}>数据分析</Menu.Item>
          <Menu.Item key="5" onClick={() => console.log('选中菜单项：提醒设置')}>提醒设置</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
            <div>HomeCat 猫舍管理</div>
            <div>
              <Button type="text">用户头像</Button>
              <Button type="text">通知</Button>
            </div>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', padding: 24, background: '#fff', minHeight: 280 }}>
          仪表盘内容区（快捷操作入口和数据概览）
        </Content>
      </Layout>
    </Layout>
  </ConfigProvider>
)
console.log('渲染完成：HomeCat界面渲染成功')