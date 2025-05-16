import { Modal, Form, Input, Select, Switch, Space } from 'antd'
import { JSX } from 'react/jsx-runtime'
import { CatDbProxy } from "../../../../db/CatDbProxy";

interface AddCatModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

function AddCatModal({ visible, onCancel, onSuccess }: AddCatModalProps): JSX.Element {
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await CatDbProxy.addCat(values)
      onSuccess()
      form.resetFields()
      onCancel()
    } catch (error) {
      console.error('添加猫咪失败:', error)
    }
  }

  return (
    <Modal
      title="添加新猫咪"
      visible={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="确认添加"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" initialValues={{ age: 1 }}>
        <Form.Item
          name="name"
          label="猫咪名称"
          rules={[{ required: true, message: '请输入猫咪名称' }]}
        >
          <Input placeholder="请输入猫咪名称" />
        </Form.Item>

        <Form.Item
          name="breed"
          label="猫咪品种"
          rules={[{ required: true, message: '请选择猫咪品种' }]}
        >
          <Select placeholder="请选择猫咪品种">
            <Select.Option value="英短">英短</Select.Option>
            <Select.Option value="美短">美短</Select.Option>
            <Select.Option value="布偶">布偶</Select.Option>
            <Select.Option value="暹罗">暹罗</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="age"
          label="年龄（岁）"
          rules={[{ required: true, type: 'number', min: 0, message: '请输入有效年龄' }]}
        >
          <Input placeholder="请输入年龄" min={0} />
        </Form.Item>

        <Space direction="vertical" size="middle">
          <Form.Item name="isPregnant" valuePropName="checked">
            <Switch checkedChildren="已怀孕" unCheckedChildren="未怀孕" />
          </Form.Item>
          <Form.Item name="isSick" valuePropName="checked">
            <Switch checkedChildren="生病中" unCheckedChildren="健康" />
          </Form.Item>
          <Form.Item name="isVaccinated" valuePropName="checked">
            <Switch checkedChildren="已接种疫苗" unCheckedChildren="未接种" />
          </Form.Item>
          <Form.Item name="isDewormed" valuePropName="checked">
            <Switch checkedChildren="已驱虫" unCheckedChildren="未驱虫" />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  )
}

export default AddCatModal