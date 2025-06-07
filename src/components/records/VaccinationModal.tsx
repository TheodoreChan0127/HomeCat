import { Form, Input, DatePicker, Modal } from 'antd';
import { CatDbProxy } from '../../db/CatDbProxy';
import React from 'react';

interface VaccinationModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function VaccinationModal({ 
  visible, 
  onCancel, 
  onSuccess 
}: VaccinationModalProps) {
  const [form] = Form.useForm();

  // Update form submission to match VaccinationRecord type
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await CatDbProxy.addVaccinationRecord({
        id: 0, // Add default ID
        vaccineBrand: values.vaccineBrand,
        injectionDate: values.injectionDate,
        petStatusId: 0 // Will need actual ID in implementation
      });
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title="疫苗记录"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="疫苗品牌"
          name="vaccineBrand"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="接种日期"
          name="injectionDate"
          rules={[{ required: true }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}