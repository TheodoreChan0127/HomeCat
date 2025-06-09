import { Form, DatePicker, Modal } from 'antd';
import { CatDbProxy } from '../../db/CatDbProxy';
import React, { useEffect } from 'react';
import { Pregnant } from '../../entity/Pregnant'; // 新增类型导入
import dayjs, { Dayjs } from 'dayjs';

interface PregnancyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  catId?: number;
  editingRecord?: Pregnant; // 新增编辑记录参数
}

export function PregnancyModal({ 
  visible, 
  onCancel, 
  onSuccess,
  catId,
  editingRecord // 新增参数
}: PregnancyModalProps) {
  const [form] = Form.useForm();

  // 新增：初始化编辑数据
  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        matingDate:dayjs(new Date(editingRecord.matingDate)),
        expectedDeliveryDate: dayjs(new Date(editingRecord.expectedDeliveryDate))
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
        catId: catId || 0,
        matingDate: values.matingDate?.toISOString(),
        expectedDeliveryDate: values.expectedDeliveryDate?.toISOString()
      };
      
      // 区分新增/更新操作
      if (editingRecord) {
        await CatDbProxy.updatePregnancy({ ...payload, id: editingRecord.id });
      } else {
        await CatDbProxy.addPregnancy(payload);
      }
      
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title={editingRecord ? "编辑怀孕记录" : "怀孕记录"} // 动态标题
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnHidden
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