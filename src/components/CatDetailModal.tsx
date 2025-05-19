import React, { JSX, useState, useEffect } from 'react'
import { Modal, Form, Input, Switch, Space, DatePicker, Select } from 'antd'
import { Cat } from '../entity/Cat'
import { CatDbProxy } from '../db/CatDbProxy'
import { getBreeds } from '../config/breeds'

interface CatDetailModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
  catData?: Cat
}

function CatDetailModal({ visible, onCancel, onSuccess, catData }: CatDetailModalProps): JSX.Element {
  const [form] = Form.useForm()
  const [breeds, setBreeds] = useState<string[]>([])
  const [isSickVisible, setIsSickVisible] = useState(false)
  const [isVaccinatedVisible, setIsVaccinatedVisible] = useState(false)
  const [isDewormedChecked, setIsDewormedChecked] = useState(false)

  useEffect(() => {
    const loadBreeds = async () => {
      const breedList = getBreeds()
      setBreeds(breedList)
    }
    loadBreeds()
    if (catData) form.setFieldsValue(catData)
  }, [catData])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await CatDbProxy.updateCat(values)
      onSuccess()
      form.resetFields()
      onCancel()
    } catch (error) {
      console.error('修改猫咪信息失败:', error)
    }
  }

  return (
    <Modal
      title="猫咪详情"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="保存修改"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" initialValues={{ age: 1 }}>
        <Form.Item name="id" label="宠物编号" rules={[{ required: true, type: 'number', min: 1, message: '宠物编号无效' }]}>
          <Input type="number" readOnly />
        </Form.Item>

        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入猫咪名称' }]}>
          <Input placeholder="请输入猫咪名称" />
        </Form.Item>

        <Form.Item name="breed" label="品种" rules={[{ required: true, message: '请选择猫咪品种' }]}>
          <Select
            placeholder="请选择猫咪品种"
            style={{ width: 200 }}
            options={breeds.map(breed => ({ value: breed, label: breed }))}
            allowClear
            showSearch
          />
        </Form.Item>

        <Form.Item name="age" label="年龄（岁）" rules={[{ required: true, type: 'number', min: 0, message: '请输入有效年龄' }]}>
          <Input type="number" placeholder="请输入年龄" min={0} />
        </Form.Item>

        <Form.Item name="fatherId" label="父ID" rules={[{ type: 'number', min: 0, message: '请输入有效父ID' }]}>
          <Input type="number" placeholder="请输入父ID（可选）" min={0} />
        </Form.Item>

        <Form.Item name="motherId" label="母ID" rules={[{ type: 'number', min: 0, message: '请输入有效母ID' }]}>
          <Input type="number" placeholder="请输入母ID（可选）" min={0} />
        </Form.Item>

        <Form.Item name="color" label="毛色" rules={[{ message: '请输入毛色' }]}>
          <Input placeholder="请输入毛色（可选）" />
        </Form.Item>

        <Form.Item name="animalType" label="动物类型" rules={[{ required: true, message: '请输入动物类型' }]}>
          <Input placeholder="请输入动物类型" />
        </Form.Item>

        <Form.Item name="birthDate" label="出生日期" rules={[{ type: 'date', message: '请选择正确的出生日期' }]}>
          <DatePicker format="YYYY-MM-DD" placeholder="请选择出生日期（可选）" />
        </Form.Item>

        <Form.Item name="arrivalDate" label="到家日期" rules={[{ type: 'date', message: '请选择正确的到家日期' }]}>
          <DatePicker format="YYYY-MM-DD" placeholder="请选择到家日期（可选）" />
        </Form.Item>

        <Form.Item name="totalIncome" label="总收益（元）" rules={[{ type: 'number', min: 0 }]}>
          <Input type="number" placeholder="请输入总收益（可选）" min={0} />
        </Form.Item>

        <Form.Item name="totalExpense" label="总支出（元）" rules={[{ type: 'number', min: 0 }]}>
          <Input type="number" placeholder="请输入总支出（可选）" min={0} />
        </Form.Item>

        <Form.Item name="weight" label="体重（kg）" rules={[{ type: 'number', min: 0 }]}>
          <Input type="number" placeholder="请输入体重（可选）" min={0} />
        </Form.Item>

        <Space direction="vertical" size="middle">
          <Form.Item name="isPregnant" valuePropName="checked">
            <Switch checkedChildren="已怀孕" unCheckedChildren="未怀孕" />
          </Form.Item>
          <Form.Item name="isSick" valuePropName="checked">
            <Switch checkedChildren="生病中" unCheckedChildren="健康" onChange={checked => setIsSickVisible(checked)} />
          </Form.Item>
        {isSickVisible && (
          <div>
            <Form.Item name="illnessName" label="患病名称" rules={[{ required: true }]}>
              <Input placeholder="请输入患病名称" />
            </Form.Item>
            <Form.Item name="treatmentMethod" label="治疗方法" rules={[{ required: true }]}>
              <Input placeholder="请输入治疗方法" />
            </Form.Item>
          </div>
        )}
          <Form.Item name="isVaccinated" valuePropName="checked">
            <Switch checkedChildren="已接种疫苗" unCheckedChildren="未接种" onChange={checked => setIsVaccinatedVisible(checked)} />
          </Form.Item>
        {isVaccinatedVisible && (
          <div>
            <Form.Item name="vaccineBrand" label="疫苗品牌" rules={[{ required: true }]}>
              <Input placeholder="请输入疫苗品牌" />
            </Form.Item>
            <Form.Item name="injectionDate" label="接种日期" rules={[{ required: true }]}>
              <DatePicker format="YYYY-MM-DD" placeholder="请选择接种日期" />
            </Form.Item>
          </div>
        )}
          <Form.Item name="isDewormed" valuePropName="checked">
            <Switch checkedChildren="已驱虫" unCheckedChildren="未驱虫" onChange={checked => setIsDewormedChecked(checked)} />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  )
}

export default CatDetailModal