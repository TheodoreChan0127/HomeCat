/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, DatePicker, Modal, Input } from 'antd';
import React from 'react';

interface DewormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  title: string;
  apiMethod: (data: any) => Promise<void>;
}

export function DewormModal({ 
  visible, 
  onCancel, 
  onSuccess, 
  title,
  apiMethod 
}: DewormModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await apiMethod({ ...values, petStatusId: 0 });
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="品牌名称"
          name="brand"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="驱虫日期"
          name="dewormingDate"
          rules={[{ required: true }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}