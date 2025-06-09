import React, { JSX, useState } from 'react'
import { Modal, Form, Input, DatePicker, Button } from 'antd'
import { Cat } from '../entity/Cat'
import { CatDbProxy } from '../db/CatDbProxy'
import { AnimalType } from '../Types/Enum'
import dayjs from 'dayjs';
import { getBreeds, saveBreeds } from '../config/breeds'

interface CatDetailModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
  cat?: Cat
}

function CatDetailModal({ visible, onCancel, cat, onSuccess }: CatDetailModalProps): JSX.Element {
  const [form] = Form.useForm()
  const [breeds, setBreeds] = useState<string[]>([]);

  // 修改表单初始化逻辑
  React.useEffect(() => {
    if (cat) {
      form.setFieldsValue({
        ...cat,
        birthDate: dayjs(fixDate(cat.birthDate)),
        arrivalDate: dayjs(fixDate(cat.arrivalDate))
      })
    }
  }, [cat, form])

  React.useEffect(() => {
    const loadBreeds = async () => {
      const breedList = getBreeds();
      setBreeds(breedList);
    };
    loadBreeds();
  }, []);
  
  const handleSubmit = async () => {
    try {
      console.log('更新前:', getCatByFormFields())
      await CatDbProxy.updateCat(getCatByFormFields())
      onSuccess()
      form.resetFields()
      onCancel()
    } catch (error) {
      console.error('更新失败:', error)
    }
  }

  // 从表单字段获取猫咪对象
  // 修复日期转换逻辑
  const getCatByFormFields = (): Cat => {
    const values = form.getFieldsValue()
    const updatedCat = new Cat()
    Object.assign(updatedCat, {
      ...cat,
      ...values,
      id: cat.id,
      animalType: AnimalType.Cat,
      age: Number(values.age),
      fatherId: values.fatherId ? Number(values.fatherId) : undefined,
      motherId: values.motherId ? Number(values.motherId) : undefined,
      birthDate: dayjs.isDayjs(values.birthDate) ? values.birthDate.toISOString() : '',
      arrivalDate: dayjs.isDayjs(values.arrivalDate) ? values.arrivalDate.toISOString() : '',
    })
    return updatedCat
  }

  // 修复日期格式
  const fixDate = (date: object | string | undefined): Date => {
    console.log(`fixDate: `, typeof date, date)

    if (typeof date === 'string') {
      return new Date(date);
    } else {
      return new Date();
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
        onFinish={handleSubmit}  // 添加表单提交绑定
      >
        <Form.Item name="name" label="名称" rules={[{ required: true }]}>
          <Input />
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

        <Form.Item name="birthDate" label="出生日期" rules={[{ type: 'date', message: '请选择正确的出生日期' }]}>
          <DatePicker format="YYYY-MM-DD" placeholder="请选择出生日期（可选）" />
        </Form.Item>

        <Form.Item name="arrivalDate" label="到家日期" rules={[{ type: 'date', message: '请选择正确的到家日期' }]}>
          <DatePicker format="YYYY-MM-DD" placeholder="请选择到家日期（可选）" />
        </Form.Item>

        <Form.Item name="totalIncome" label="总收益（元）" >
          <Input type="number" />
        </Form.Item>

        <Form.Item name="totalExpense" label="总支出（元）" >
          <Input type="number" />
        </Form.Item>

        <Form.Item name="weight" label="体重（kg）" >
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CatDetailModal