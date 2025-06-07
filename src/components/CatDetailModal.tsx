import React, { JSX } from 'react'
import { Modal, Form, Input, DatePicker } from 'antd'
import { Cat } from '../entity/Cat'
import { CatDbProxy } from '../db/CatDbProxy'
import { AnimalType } from '../Types/Enum'
import dayjs from 'dayjs';

interface CatDetailModalProps {
  visible: boolean
  onCancel: () => void
  cat: Cat
  onSuccess: () => void
}

function CatDetailModal({ visible, onCancel, cat, onSuccess }: CatDetailModalProps): JSX.Element {
  const [form] = Form.useForm()

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
  
  const handleSubmit = async () => {
    try {
      console.log('更新前:', getCatByFormFields())
      await CatDbProxy.updateCat(getCatByFormFields())
      onSuccess()
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
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="breed" label="品种" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="age" label="年龄（岁）" rules={[{ type: 'number', min: 0 }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="fatherId" label="父ID" rules={[{ type: 'number', min: 0 }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="motherId" label="母ID" rules={[{ type: 'number', min: 0 }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="color" label="毛色">
          <Input />
        </Form.Item>

        <Form.Item name="birthDate" label="出生日期">
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="arrivalDate" label="到家日期">
          <DatePicker format="YYYY-MM-DD" />
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