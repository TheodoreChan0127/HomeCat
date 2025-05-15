import { DatePicker, Button, Timeline, Modal, Form, Input } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import { DashboardLayout } from '../ui/components/dashboard/dashboard' // 新增布局导入
import { JSX } from 'react/jsx-runtime'

function DailyRecords(): JSX.Element {
  const [visible, setVisible] = React.useState(false)
  const [form] = Form.useForm()

  const handleAddRecord = () => {
    form.resetFields()
    setVisible(true)
  }

  const handleOk = () => {
    form.submit()
    setVisible(false)
  }

  return (
    <DashboardLayout> {/* 新增布局包裹 */}
      <div className="p-4">
        <div className="flex justify-between mb-4 items-center">
          <DatePicker defaultValue={dayjs()} />
          <Button type="primary" onClick={handleAddRecord}>+ 添加记录</Button>
        </div>

        {/* 时间轴记录 */}
        <Timeline mode="alternate">
          {[1, 2, 3].map((i) => (
            <Timeline.Item key={i} label={`2024-03-0${i} 18:00`}>
              今日喂食：皇家幼猫粮50g + 鸡胸肉100g
            </Timeline.Item>
          ))}
        </Timeline>

        {/* 添加记录模态框 */}
        <Modal
          title="新增日常记录"
          open={visible}
          onOk={handleOk}
          onCancel={() => setVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="content" label="记录内容" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="请输入记录内容" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default DailyRecords