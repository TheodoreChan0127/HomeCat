import { Form, DatePicker, Modal } from 'antd';
import { Pregnant } from '../../entity/Pregnant';
import { CatDbProxy } from '../../db/CatDbProxy';
import React from 'react';

interface PregnancyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function PregnancyModal({ visible, onCancel, onSuccess }: PregnancyModalProps) {
  const [form] = Form.useForm<Pregnant>();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await CatDbProxy.addPregnancy({ ...values, petStatusId: 0 }); // 实际使用需传入正确petStatusId
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title="怀孕记录"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="交配日期"
          name="matingDate"
          rules={[{ required: true, message: '请选择交配日期' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          label="预产期"
          name="expectedDeliveryDate"
          rules={[{ required: true, message: '请选择预产期' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}