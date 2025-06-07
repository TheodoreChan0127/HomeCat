import { Form, Input, DatePicker, Modal } from 'antd';
import { WeightRecord } from '../../entity/WeightRecord';
import { CatDbProxy } from '../../db/CatDbProxy';
import React from 'react';

interface WeightRecordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function WeightRecordModal({ visible, onCancel, onSuccess }: WeightRecordModalProps) {
  const [form] = Form.useForm<WeightRecord>();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await CatDbProxy.addWeightRecord({ ...values, petStatusId: 0 }); // 实际使用需传入正确petStatusId
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title="记录体重"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="体重（kg）"
          name="weight"
          rules={[{ required: true, message: '请输入体重数值' }]}
        >
          <Input type="number" step="0.1" />
        </Form.Item>
        <Form.Item
          label="称重日期"
          name="weighDate"
          rules={[{ required: true, message: '请选择称重日期' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
