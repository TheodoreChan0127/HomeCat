import { List, Switch, Select, Button, Space } from 'antd'
import { DragOutlined } from '@ant-design/icons' // 修正图标导入
import React from 'react'
import { JSX } from 'react/jsx-runtime'
import { DashboardLayout } from '../components/dashboard'

interface ReminderItem {
  id: number
  type: string
  enabled: boolean
  frequency: string
  channels: string[]
}

const reminderList: ReminderItem[] = [
  { id: 1, type: '疫苗提醒', enabled: true, frequency: '每30天', channels: ['APP通知'] },
  { id: 2, type: '驱虫提醒', enabled: false, frequency: '每45天', channels: ['短信', 'APP通知'] },
  { id: 3, type: '体重提醒', enabled: true, frequency: '每周', channels: ['微信'] }
]

function ReminderSettings(): JSX.Element {
  const { Option } = Select

  return (
    <DashboardLayout> {/* 新增布局包裹 */}
      <div className="p-4">
        <List
          header={
            <Space>
              <Button type="primary">全选</Button>
              <Button>批量删除</Button>
              <Button>批量启用</Button>
            </Space>
          }
          itemLayout="horizontal"
          dataSource={reminderList}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Switch key={`switch-${item.id}`} checked={item.enabled} />,
                <Select key={`frequency-${item.id}`} defaultValue={item.frequency} style={{ width: 120 }}>
                  <Option value="每天">每天</Option>
                  <Option value="每周">每周</Option>
                  <Option value="每月">每月</Option>
                </Select>,
                <Select key={`channels-${item.id}`} mode="multiple" defaultValue={item.channels} style={{ width: 160 }}>
                  <Option value="APP通知">APP通知</Option>
                  <Option value="短信">短信</Option>
                  <Option value="微信">微信</Option>
                </Select>
              ]}
            >
              <List.Item.Meta
                avatar={<DragOutlined />}
                title={item.type}
              />
            </List.Item>
          )}
        />
      </div>
    </DashboardLayout>
  )
}

export default ReminderSettings