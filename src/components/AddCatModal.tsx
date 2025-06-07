import React,{ JSX, useState, useEffect } from "react"
import { getBreeds, saveBreeds } from '../config/breeds'
import { CatDbProxy } from '../db/CatDbProxy'
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd'

interface AddCatModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

function AddCatModal({ visible, onCancel, onSuccess }: AddCatModalProps): JSX.Element {
  const [form] = Form.useForm()
  const [breeds, setBreeds] = useState<string[]>([]);

  useEffect(() => {
    const loadBreeds = async () => {
      const breedList = getBreeds();
      setBreeds(breedList);
    };
    loadBreeds();
  }, []);

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

        <Form.Item name="newBreedInput">
            <Input
              placeholder="输入新品种"
              style={{ width: 200 }}
            />
            <Button 
              type="primary"
              onClick={() => {
                const newBreed = form.getFieldValue('newBreedInput');
                if (newBreed && !breeds.includes(newBreed)) {
                  const newBreeds = [...breeds, newBreed];
                  setBreeds(newBreeds);
                  saveBreeds(newBreeds);
                  form.setFieldsValue({ 
                    breed: newBreed,
                    newBreedInput: ''
                  });
                }
              }}
            >
              添加品种
            </Button>
        </Form.Item>

        <Form.Item
          name="age"
          label="年龄（岁）"
          rules={[{message: '请输入有效年龄' }]}
        >
          <Input placeholder="请输入年龄" min={0} />
        </Form.Item>

        <Form.Item
          name="fatherId"
          label="父ID"
          rules={[{ message: '请输入有效父ID' }]}
        >
          <Input placeholder="请输入父ID（可选）" min={0} />
        </Form.Item>

        <Form.Item
          name="motherId"
          label="母ID"
          rules={[{ message: '请输入有效母ID' }]}
        >
          <Input placeholder="请输入母ID（可选）" min={0} />
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
          <DatePicker format="YYYY-MM-DD" placeholder="请选择出生日期（可选）" />
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