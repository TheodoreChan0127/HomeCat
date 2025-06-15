/* eslint-disable @typescript-eslint/no-explicit-any */
import React,{ JSX, useState, useEffect } from "react"
import { getBreeds } from '../config/breedSettings'
import { CatDbProxy } from '../db/CatDbProxy'
import { Modal, Form, Input, Select, DatePicker, Radio } from 'antd'
import dayjs from 'dayjs'

interface AddCatModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

function AddCatModal({ visible, onCancel, onSuccess }: AddCatModalProps): JSX.Element {
  const [form] = Form.useForm()
  const [breeds, setBreeds] = useState<string[]>([]);
  const [cats, setCats] = useState<any[]>([]);

  useEffect(() => {
    loadBreeds();

    // 每次打开模态框时重新加载猫咪列表
    if (visible) {
      CatDbProxy.getCats({ currentPage: 1, itemsPerPage: 999, filters: {} }).then(res => setCats(res.data));
    }
  }, [visible]); // 添加 visible 作为依赖项

  const loadBreeds = async () => {
    const breedList = getBreeds();
    setBreeds(breedList);
  };

  // 计算年龄的函数
  const calculateAge = (birthDate: dayjs.Dayjs | null) => {
    if (!birthDate) return undefined;
    const today = dayjs();
    const ageInMonths = today.diff(birthDate, 'month');
    return ageInMonths;
  };

  // 处理出生日期变化
  const handleBirthDateChange = (date: dayjs.Dayjs | null) => {
    const age = calculateAge(date);
    form.setFieldValue('age', age);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields()
      // 转换日期格式
      const processedValues = {
        ...values,
        birthDate: values.birthDate?.toISOString(),
        arrivalDate: values.arrivalDate?.toISOString()
      }
      // 插入主表并获取ID
      await CatDbProxy.addCat(processedValues)
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
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="确认添加"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" >
        <Form.Item
          name="name"
          label="猫咪名称"
          rules={[{ required: true, message: '请输入猫咪名称' }]}
        >
          <Input placeholder="请输入猫咪名称" />
        </Form.Item>

        <Form.Item
          name="gender"
          label="性别"
          rules={[{ required: true, message: '请选择性别' }]}
        >
          <Radio.Group>
            <Radio value="male">公猫</Radio>
            <Radio value="female">母猫</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="breed"
          label="猫咪品种"
          rules={[{ required: true, message: '请选择猫咪品种' }]}
        >
          <Select
            placeholder="请选择猫咪品种"
            style={{ width: 200 }}
            options={breeds.map(breed => ({ value: breed, label: breed }))}
            allowClear
            showSearch
          />
        </Form.Item>

        <Form.Item
          name="age"
          label="年龄（月）"
        >
          <Input placeholder="年龄将根据出生日期自动计算" disabled />
        </Form.Item>

        <Form.Item
          name="fatherId"
          label="父ID"
        > 
          <Select
            showSearch
            allowClear
            placeholder="请选择父猫（可选）"
            filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}
          >
            {cats.filter(cat => cat.gender === 'male').map(cat => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="motherId"
          label="母ID"
        >
          <Select
            showSearch
            allowClear
            placeholder="请选择母猫（可选）"
            filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}
          >
            {cats.filter(cat => cat.gender === 'female').map(cat => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="color"
          label="毛色"
          rules={[{ message: '请输入毛色' }]}
        >
          <Input placeholder="请输入毛色（可选）" />
        </Form.Item>

        <Form.Item
          name="birthDate"
          label="出生日期"
          rules={[{ type: 'date', message: '请选择正确的出生日期' }]}
        >
          <DatePicker 
            format="YYYY-MM-DD" 
            placeholder="请选择出生日期（可选）" 
            onChange={handleBirthDateChange}
          />
        </Form.Item>

        <Form.Item
          name="arrivalDate"
          label="到家日期"
          rules={[{ type: 'date', message: '请选择正确的到家日期' }]}
        >
          <DatePicker format="YYYY-MM-DD" placeholder="请选择到家日期（可选）" />
        </Form.Item>

        <Form.Item
          name="totalIncome"
          label="总收益（元）"
        >
          <Input placeholder="请输入总收益（可选）" min={0} />
        </Form.Item>

        <Form.Item
          name="totalExpense"
          label="总支出（元）"
        >
          <Input placeholder="请输入总支出（可选）" min={0} />
        </Form.Item>

        <Form.Item
          name="weight"
          label="体重（kg）"
        >
          <Input placeholder="请输入体重（可选）" min={0} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddCatModal