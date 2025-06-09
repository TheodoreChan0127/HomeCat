import { Form, Input, DatePicker, Modal } from 'antd';
import { CatDbProxy } from '../../db/CatDbProxy';
import React, { useEffect } from 'react';
import { WeightRecord } from '../../entity/WeightRecord'; // 新增类型导入
import dayjs from 'dayjs';

interface WeightRecordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  catId?: number;
  editingRecord?: WeightRecord; // 新增编辑记录参数
}

export function WeightRecordModal({ 
  visible, 
  onCancel, 
  onSuccess,
  catId,
  editingRecord // 新增参数
}: WeightRecordModalProps) {
  const [form] = Form.useForm();

  // 新增：初始化编辑数据
  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        weight: editingRecord.weight,
        weighDate: dayjs(new Date(editingRecord.weighDate))
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
        weighDate: values.weighDate?.toISOString(),
        catId: catId || 0
      };
      
      // 区分新增/更新操作
      if (editingRecord) {
        await CatDbProxy.updateWeightRecord({ ...payload, id: editingRecord.id });
      } else {
        await CatDbProxy.addWeightRecord(payload);
      }
      
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title={editingRecord ? "编辑体重记录" : "记录体重"} // 动态标题
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnHidden
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
