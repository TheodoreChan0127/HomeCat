/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Switch, Card } from 'antd';
import { getPregnancySettings, savePregnancySettings } from '../../config/pregnancySettings';
import { useMessage } from '../../hooks/useMessage';

const PregnancySettings: React.FC = () => {
  const [form] = Form.useForm();
  const { messageApi, contextHolder } = useMessage();
  const [settings, setSettings] = useState({
    pregnancyDuration: 63, // 默认怀孕天数
    enableReminders: true, // 是否启用怀孕提醒
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

  const handleValuesChange = (changedValues: any, _allValues: any) => {
    const newSettings = {
      ...settings,
      ...changedValues
    };
    setSettings(newSettings);
    savePregnancySettings(newSettings);
    messageApi.success('设置已保存');
  };

  return (
    <>
      {contextHolder}
      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            label="默认怀孕天数"
            name="pregnancyDuration"
            rules={[
              { required: true, message: '请输入默认怀孕天数' },
              { type: 'number', min: 1, message: '天数必须大于0' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="启用怀孕提醒"
            name="enablePregnancyReminder"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

        </Form>
      </Card>
    </>
  );
};

export default PregnancySettings; 