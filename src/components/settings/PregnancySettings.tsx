/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Switch, Card, message } from 'antd';
import { getPregnancySettings, savePregnancySettings } from '../../config/pregnancySettings';

const PregnancySettings: React.FC = () => {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState({
    pregnancyDuration: 63,
    enableReminders: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = getPregnancySettings();
    if (savedSettings) {
      setSettings(savedSettings);
      form.setFieldsValue(savedSettings);
    }
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    const newSettings = {
      ...settings,
      ...changedValues
    };
    setSettings(newSettings);
    savePregnancySettings(newSettings);
    message.success('设置已保存');
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          label="怀孕周期（天）"
          name="pregnancyDuration"
          rules={[
            { required: true, message: '请输入怀孕周期' },
            { type: 'number', min: 1, message: '怀孕周期必须大于0' }
          ]}
        >
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item
          label="启用提醒"
          name="enableReminders"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PregnancySettings; 