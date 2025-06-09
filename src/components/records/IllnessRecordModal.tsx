import { Form, Input, Modal } from 'antd';
import { CatDbProxy } from '../../db/CatDbProxy';
import React, { useEffect } from 'react';
import { Illness } from '../../entity/Illness';

interface IllnessRecordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  catId?: number;
  editingRecord?: Illness;
}

export function IllnessRecordModal({ 
  visible, 
  onCancel, 
  onSuccess,
  catId,
  editingRecord 
}: IllnessRecordModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        illnessName: editingRecord.illnessName,
        treatmentMethod: editingRecord.treatmentMethod
      });
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        catId: catId || 0
      };
      
      if (editingRecord) {
        await CatDbProxy.updateIllness({ ...payload, id: editingRecord.id });
      } else {
        await CatDbProxy.addIllness(payload);
      }
      
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('提交疾病记录失败:', error);
    }
  };

  return (
    <Modal
      title={editingRecord ? "编辑疾病记录" : "新增疾病记录"}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="疾病名称"
          name="illnessName"
          rules={[{ required: true, message: '请输入疾病名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="治疗方法"
          name="treatmentMethod"
          rules={[{ required: true, message: '请输入治疗方法' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}