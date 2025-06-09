import { Form, Input, DatePicker, Modal } from 'antd';
import { CatDbProxy } from '../../db/CatDbProxy';
import React, { useEffect } from 'react';
import { VaccinationRecord } from '../../entity/VaccinationRecord'; // 新增类型导入
import dayjs, { Dayjs } from 'dayjs';

interface VaccinationModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  catId?: number;
  editingRecord?: VaccinationRecord; // 新增编辑记录参数
}

export function VaccinationModal({ 
  visible, 
  onCancel, 
  onSuccess,
  catId,
  editingRecord // 新增参数
}: VaccinationModalProps) {
  const [form] = Form.useForm();

  // 新增：初始化编辑数据
  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        vaccineBrand: editingRecord.vaccineBrand,
        injectionDate: dayjs(new Date(editingRecord.injectionDate))
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
        injectionDate: values.injectionDate?.toISOString(),
        catId: catId || 0
      };
      
      // 区分新增/更新操作
      if (editingRecord) {
        await CatDbProxy.updateVaccinationRecord({ ...payload, id: editingRecord.id });
      } else {
        await CatDbProxy.addVaccinationRecord(payload);
      }
      
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <Modal
      title={editingRecord ? "编辑疫苗记录" : "疫苗记录"} // 动态标题
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="疫苗品牌"
          name="vaccineBrand"
          rules={[{ required: true, message: '请输入疫苗品牌' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="接种日期"
          name="injectionDate"
          rules={[{ required: true, message: '请选择接种日期' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}