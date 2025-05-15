import { Tabs, Button, Card, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { DashboardLayout } from '../ui/components/dashboard/dashboard' // 新增布局导入
import { JSX } from 'react/jsx-runtime'

// Remove unused CatProfileProps interface
// interface CatProfileProps {} // Remove this line

function CatProfile(): JSX.Element {
  const { TabPane } = Tabs

  const uploadProps = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: { authorization: 'authorization-text' },
    onChange(info) {
      if (info.file.status !== 'uploading') console.log(info.file, info.fileList)
      if (info.file.status === 'done') message.success(`${info.file.name} 上传成功`)
      if (info.file.status === 'error') message.error(`${info.file.name} 上传失败`)
    }
  }

  return (
    <DashboardLayout> {/* 新增布局包裹 */}
      <div className="p-4">
        {/* 顶部信息卡片 */}
        <Card className="mb-4" title="猫咪基本信息">
          <div className="flex items-center gap-4">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传头像</Button>
            </Upload>
            <div>
              <h2 className="text-xl font-semibold">糯米</h2>
              <p className="text-gray-600">英短蓝白 · 雌性 · 1岁3个月</p>
            </div>
          </div>
        </Card>

        {/* Tab导航 */}
        <Tabs defaultActiveKey="1" className="mb-16">
          <TabPane tab="基本信息" key="1">基本信息内容区</TabPane>
          <TabPane tab="健康档案" key="2">疫苗/驱虫记录区</TabPane>
          <TabPane tab="成长数据" key="3">体重/体长趋势图</TabPane>
        </Tabs>

        {/* 底部操作栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-2">
          <Button type="primary">编辑</Button>
          <Button danger>删除</Button>
          <Button>导出PDF</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CatProfile