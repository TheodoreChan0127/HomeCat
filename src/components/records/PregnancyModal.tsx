import { Form, DatePicker, Modal, Input, InputNumber, Switch } from 'antd';
import { CatDbProxy } from '../../db/CatDbProxy';
import React, { useEffect } from 'react';
import { Pregnant } from '../../entity/Pregnant';
import dayjs, { Dayjs } from 'dayjs';
import { getPregnancySettings } from '../../config/pregnancySettings';

interface PregnancyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  catId?: number;
  editingRecord?: Pregnant;
}

export function PregnancyModal({ 
  visible, 
  onCancel, 
  onSuccess,
  catId,
  editingRecord
}: PregnancyModalProps) {
  const [form] = Form.useForm();

  // 计算提醒日期
  const calculateReminderDates = (matingDate: Dayjs) => {
    const settings = getPregnancySettings();
    const expectedDeliveryDate = matingDate.add(settings.pregnancyDuration, 'day');
    const dates: { [key: string]: Dayjs | null } = {
      expectedDeliveryDate,
      reminder7Days: null,
      reminder3Days: null,
      reminder1Day: null
    };

    if (settings.enableReminders === true) {
      // 使用固定的提醒天数
      const reminderDays = [7, 3, 1];
      reminderDays.forEach(days => {
        dates[`reminder${days}${days === 1 ? 'Day' : 'Days'}`] = expectedDeliveryDate.subtract(days, 'day');
      });
    }

    return dates;
  };

  // 监听交配日期变化
  const handleMatingDateChange = (date: Dayjs | null) => {
    if (date) {
      const dates = calculateReminderDates(date);
      form.setFieldsValue({
        expectedDeliveryDate: dates.expectedDeliveryDate,
        reminder7Days: dates.reminder7Days,
        reminder3Days: dates.reminder3Days,
        reminder1Day: dates.reminder1Day
      });
    }
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        matingDate: dayjs(new Date(editingRecord.matingDate)),
        expectedDeliveryDate: dayjs(new Date(editingRecord.expectedDeliveryDate)),
        reminder7Days: dayjs(new Date(editingRecord.reminder7Days)),
        reminder3Days: dayjs(new Date(editingRecord.reminder3Days)),
        reminder1Day: dayjs(new Date(editingRecord.reminder1Day)),
        isDelivered: editingRecord.isDelivered,
        deliveryCount: editingRecord.deliveryCount,
        notes: editingRecord.notes
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
        matingDate: values.matingDate?.toISOString() || null,
        expectedDeliveryDate: values.expectedDeliveryDate?.toISOString() || null,
        reminder7Days: values.reminder7Days ? values.reminder7Days.toISOString() : null,
        reminder3Days: values.reminder3Days ? values.reminder3Days.toISOString() : null,
        reminder1Day: values.reminder1Day ? values.reminder1Day.toISOString() : null
      };
      
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
      title={editingRecord ? "编辑怀孕记录" : "怀孕记录"}
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
          <DatePicker format="YYYY-MM-DD" onChange={handleMatingDateChange} />
        </Form.Item>
        <Form.Item
          label="预产期"
          name="expectedDeliveryDate"
          rules={[{ required: true, message: '请选择预产期' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          label="7天提醒日期"
          name="reminder7Days"
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          label="3天提醒日期"
          name="reminder3Days"
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          label="1天提醒日期"
          name="reminder1Day"
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          label="是否已生产"
          name="isDelivered"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label="生产数量"
          name="deliveryCount"
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="备注"
          name="notes"
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
}