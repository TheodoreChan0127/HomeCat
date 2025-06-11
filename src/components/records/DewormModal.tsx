/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, DatePicker, Modal, Input } from 'antd';
import React, { useEffect } from 'react';
import { ExternalDeworming } from '../../entity/ExternalDeworming'; // 新增类型导入
import { InternalDeworming } from '../../entity/InternalDeworming'; // 新增类型导入
import dayjs from 'dayjs';

interface DewormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  title: string;
  apiMethod: (data: any) => Promise<any>;
  catId?: number;
  editingRecord?: ExternalDeworming | InternalDeworming; // 新增编辑记录参数
}

export function DewormModal({ 
  visible, 
  onCancel, 
  onSuccess, 
  title,
  apiMethod,
  catId,
  editingRecord // 新增参数
}: DewormModalProps) {
  const [form] = Form.useForm();

  // 新增：初始化编辑数据
  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        brand: editingRecord.brand,
        dewormingDate: dayjs(new Date(editingRecord.dewormingDate))
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
        dewormingDate: values.dewormingDate?.toISOString(),
        catId: catId || 0
      };
      
      // 传递编辑记录ID（如果有）
      if (editingRecord) {
        await apiMethod({ ...payload, id: editingRecord.id });
      } else {
        await apiMethod(payload);
      }
      
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title={editingRecord ? `编辑${title}` : title} // 动态标题
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="品牌名称"
          name="brand"
          rules={[{ required: true, message: '请输入品牌名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="驱虫日期"
          name="dewormingDate"
          rules={[{ required: true, message: '请选择驱虫日期' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}