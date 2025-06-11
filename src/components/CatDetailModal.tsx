import React, { JSX, useState, useEffect } from 'react'
import { Modal, Form, Input, DatePicker, Select, Space, Tag } from 'antd'
import { Cat } from '../entity/Cat'
import { CatDbProxy } from '../db/CatDbProxy'
import { AnimalType } from '../Types/Enum'
import dayjs from 'dayjs';
import { getBreeds } from '../config/breeds'

interface CatDetailModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
  cat?: Cat
}

function CatDetailModal({ visible, onCancel, cat, onSuccess }: CatDetailModalProps): JSX.Element {
  const [form] = Form.useForm()
  const [breeds, setBreeds] = useState<string[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);

  // 修改表单初始化逻辑
  useEffect(() => {
    if (cat) {
      form.setFieldsValue({
        ...cat,
        birthDate: cat.birthDate ? dayjs(cat.birthDate) : undefined,
        arrivalDate: cat.arrivalDate ? dayjs(cat.arrivalDate) : undefined
      })
    }
  }, [cat, form])

  useEffect(() => {
    const loadBreeds = async () => {
      const breedList = getBreeds();
      setBreeds(breedList);
    };
    loadBreeds();

    // 加载猫咪列表
    CatDbProxy.getCats({ currentPage: 1, itemsPerPage: 100, filters: {} }).then(res => setCats(res.data));
  }, []);
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const updatedCat = {
        ...cat,
        ...values,
        id: cat?.id,
        animalType: AnimalType.Cat,
        age: Number(values.age),
        fatherId: values.fatherId ? Number(values.fatherId) : undefined,
        motherId: values.motherId ? Number(values.motherId) : undefined,
        birthDate: values.birthDate?.toISOString(),
        arrivalDate: values.arrivalDate?.toISOString(),
        totalIncome: Number(values.totalIncome) || 0,
        totalExpense: Number(values.totalExpense) || 0,
        weight: Number(values.weight) || 0
      }
      await CatDbProxy.updateCat(updatedCat)
      onSuccess()
      form.resetFields()
      onCancel()
    } catch (error) {
      console.error('更新失败:', error)
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
      <Form 
        form={form} 
        layout="vertical"
      >
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
          <Select
            placeholder="请选择猫咪品种"
            style={{ width: '100%' }}
            options={breeds.map(breed => ({ value: breed, label: breed }))}
            allowClear
            showSearch
          />
        </Form.Item>

        <Form.Item label="猫咪状态">
          <Space wrap>
            <Form.Item name="isPregnant" valuePropName="checked" noStyle>
              <Tag color={cat?.isPregnant ? "red" : "default"}>
                {cat?.isPregnant ? "怀孕中" : "未怀孕"}
              </Tag>
            </Form.Item>
            <Form.Item name="isSick" valuePropName="checked" noStyle>
              <Tag color={cat?.isSick ? "orange" : "default"}>
                {cat?.isSick ? "生病中" : "健康"}
              </Tag>
            </Form.Item>
            <Form.Item name="isVaccinated" valuePropName="checked" noStyle>
              <Tag color={cat?.isVaccinated ? "green" : "default"}>
                {cat?.isVaccinated ? "已接种疫苗" : "未接种疫苗"}
              </Tag>
            </Form.Item>
            <Form.Item name="isDewormed" valuePropName="checked" noStyle>
              <Tag color={cat?.isDewormed ? "blue" : "default"}>
                {cat?.isDewormed ? "已驱虫" : "未驱虫"}
              </Tag>
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item
          name="age"
          label="年龄（月）"
          rules={[{ required: true, message: '请输入有效年龄' }]}
        >
          <Input type="number" placeholder="请输入年龄" min={0} />
        </Form.Item>

        <Form.Item
          name="fatherId"
          label="父猫"
        >
          <Select
            showSearch
            allowClear
            placeholder="请选择父猫（可选）"
            filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}
          >
            {cats.map(cat => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="motherId"
          label="母猫"
        >
          <Select
            showSearch
            allowClear
            placeholder="请选择母猫（可选）"
            filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}
          >
            {cats.map(cat => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="color"
          label="毛色"
        >
          <Input placeholder="请输入毛色（可选）" />
        </Form.Item>

        <Form.Item
          name="birthDate"
          label="出生日期"
        >
          <DatePicker format="YYYY-MM-DD" placeholder="请选择出生日期（可选）" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="arrivalDate"
          label="到家日期"
        >
          <DatePicker format="YYYY-MM-DD" placeholder="请选择到家日期（可选）" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="totalIncome"
          label="总收益（元）"
        >
          <Input type="number" placeholder="请输入总收益（可选）" min={0} />
        </Form.Item>

        <Form.Item
          name="totalExpense"
          label="总支出（元）"
        >
          <Input type="number" placeholder="请输入总支出（可选）" min={0} />
        </Form.Item>

        <Form.Item
          name="weight"
          label="体重（kg）"
        >
          <Input type="number" placeholder="请输入体重（可选）" min={0} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CatDetailModal