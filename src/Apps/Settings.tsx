import React from 'react';
import { Card, Space } from 'antd';
import { DatabaseOutlined, ExperimentOutlined, TagOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons';
import BreedSettings from '../components/settings/BreedSettings';
import PregnancySettings from '../components/settings/PregnancySettings';
import DatabaseSettings from '../components/settings/DatabaseSettings';
import DashboardLayout from '../components/dashboard';
import PageTitle from '../components/PageTitle';
import ConfigSettings from '../components/settings/ConfigSettings';

const Settings: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <PageTitle 
          title="设置" 
          subtitle="管理系统配置和数据库"
          icon={<SettingOutlined />}
        />
        
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          
          <Card 
            title={
              <Space>
                <ExperimentOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                <span style={{ fontSize: 16, fontWeight: 500 }}>怀孕设置</span>
              </Space>
            }
            variant="borderless"
            styles={{ body: { padding: '24px 0' } }}
            className="hover:shadow-md transition-shadow duration-300"
          >
            <PregnancySettings />
          </Card>
          
        <Card 
          title={
            <Space>
              <ToolOutlined style={{ fontSize: 20, color: '#1677ff' }} />
              <span style={{ fontSize: 16, fontWeight: 500 }}>数据配置</span>
            </Space>
          }
          variant="borderless"
          styles={{ body: { padding: '24px 0' } }}
          className="hover:shadow-md transition-shadow duration-300"
        >
          <ConfigSettings />
        </Card>

        <Card 
            title={
              <Space>
                <TagOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                <span style={{ fontSize: 16, fontWeight: 500 }}>品种管理</span>
              </Space>
            }
            variant="borderless"
            styles={{ body: { padding: '24px 0' } }}
            className="hover:shadow-md transition-shadow duration-300"
          >
            <BreedSettings />
          </Card>

        <Card 
            title={
              <Space>
                <DatabaseOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                <span style={{ fontSize: 16, fontWeight: 500 }}>数据库管理</span>
              </Space>
            }
            variant="borderless"
            styles={{ body: { padding: '24px 0' } }}
            className="hover:shadow-md transition-shadow duration-300"
          >
            <DatabaseSettings />
          </Card>

        </Space>
      </div>
    </DashboardLayout>
  );
};

export default Settings;