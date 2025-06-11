/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Card, Typography, message } from 'antd';
import { getConfigSettings, saveConfigSettings } from '../../config/configSettings';
import { useMessage } from '../../hooks/useMessage';

const { Title } = Typography;

const ConfigSettings: React.FC = () => {
  const [form] = Form.useForm();
  const { messageApi, contextHolder } = useMessage();
  const [settings, setSettings] = useState({
    weightReminderInterval: 7, // 称重提醒间隔（天）
    vaccineReminderInterval: 30, // 疫苗注射提醒间隔（天）
    externalDewormingInterval: 30, // 体外驱虫提醒间隔（天）
    internalDewormingInterval: 30, // 体内驱虫提醒间隔（天）
    ageReminderInterval: 7, // 年龄提醒间隔（天）
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = getConfigSettings();
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
    saveConfigSettings(newSettings);
    messageApi.success('设置已保存');
  };

  return (
    <>
      {contextHolder}
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>提醒设置</Title>
        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            label="称重提醒时间间隔（天）"
            name="weightReminderInterval"
            rules={[
              { required: true, message: '请输入称重提醒时间间隔' },
              { type: 'number', min: 1, message: '时间间隔必须大于0' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="疫苗注射提醒时间间隔（天）"
            name="vaccineReminderInterval"
            rules={[
              { required: true, message: '请输入疫苗注射提醒时间间隔' },
              { type: 'number', min: 1, message: '时间间隔必须大于0' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="体外驱虫提醒时间间隔（天）"
            name="externalDewormingInterval"
            rules={[
              { required: true, message: '请输入体外驱虫提醒时间间隔' },
              { type: 'number', min: 1, message: '时间间隔必须大于0' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="体内驱虫提醒时间间隔（天）"
            name="internalDewormingInterval"
            rules={[
              { required: true, message: '请输入体内驱虫提醒时间间隔' },
              { type: 'number', min: 1, message: '时间间隔必须大于0' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="年龄提醒时间间隔（天）"
            name="ageReminderInterval"
            rules={[
              { required: true, message: '请输入年龄提醒时间间隔' },
              { type: 'number', min: 1, message: '时间间隔必须大于0' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default ConfigSettings; 