import React, { JSX, useEffect } from 'react'
import { useActionState } from 'react-hook-form'
import { Modal, Form, Input, Switch, Space, DatePicker } from 'antd'
import { Cat } from '../entity/Cat'
import { CatDbProxy } from '../db/CatDbProxy'
import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { ActionResponse } from '../types/actions'

interface CatDetailModalProps {
  visible: boolean
  onCancel: () => void
  cat: Cat
  onSuccess: () => void
}

const CatSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  breed: z.string().min(1, '品种不能为空'),
  age: z.number().min(0, '年龄不能为负'),
  fatherId: z.number().min(0, '父ID不能为负').optional(),
  motherId: z.number().min(0, '母ID不能为负').optional(),
  color: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  arrivalDate: z.string().datetime().optional(),
  totalIncome: z.number().min(0, '收益不能为负').optional(),
  totalExpense: z.number().min(0, '支出不能为负').optional(),
  weight: z.number().min(0, '体重不能为负').optional(),
  isPregnant: z.boolean(),
  isSick: z.boolean(),
  isVaccinated: z.boolean(),
  isDewormed: z.boolean()
})

const updateCatAction = createSafeActionClient()
  .schema(CatSchema)
  .action(async (input: z.infer<typeof CatSchema>): Promise<ActionResponse<Cat>> => {
    try {
      const updatedCat = await CatDbProxy.updateCat(input)
      return { success: true, data: updatedCat }
    } catch (error) {
      return { success: false, error: '更新猫咪信息失败' }
    }
  })

function CatDetailModal({ visible, onCancel, cat, onSuccess }: CatDetailModalProps): JSX.Element {
  const [form] = Form.useForm()
  const [actionState, dispatch] = useActionState(updateCatAction)

  useEffect(() => {
    form.setFieldsValue(cat)
  }, [cat])

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const result = await dispatch(values)
    if (result.success) {
      onSuccess()
      onCancel()
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

        <Form.Item name="totalIncome" label="总收益（元）" rules={[{ type: 'number', min: 0 }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="totalExpense" label="总支出（元）" rules={[{ type: 'number', min: 0 }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="weight" label="体重（kg）" rules={[{ type: 'number', min: 0 }]}>
          <Input type="number" />
        </Form.Item>

        <Space direction="vertical">
          <Form.Item name="isPregnant" valuePropName="checked">
            <Switch checkedChildren="已怀孕" unCheckedChildren="未怀孕" />
          </Form.Item>
          <Form.Item name="isSick" valuePropName="checked">
            <Switch checkedChildren="生病中" unCheckedChildren="健康" />
          </Form.Item>
          <Form.Item name="isVaccinated" valuePropName="checked">
            <Switch checkedChildren="已接种" unCheckedChildren="未接种" />
          </Form.Item>
          <Form.Item name="isDewormed" valuePropName="checked">
            <Switch checkedChildren="已驱虫" unCheckedChildren="未驱虫" />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  )
}

export default CatDetailModal