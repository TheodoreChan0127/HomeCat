import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, List, Space, Typography, Row, Col } from 'antd';
import { useMessage } from '../../hooks/useMessage';
import { useModal } from '../../hooks/useModal';
import { getBreeds, saveBreeds } from '../../config/breedSettings';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

const { Title } = Typography;

const BreedSettings: React.FC = () => {
  const [form] = Form.useForm();
  const { messageApi, contextHolder: messageContextHolder } = useMessage();
  const { showConfirm, contextHolder: modalContextHolder } = useModal();
  const [breeds, setBreeds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    loadBreeds();
  }, []);

  const loadBreeds = () => {
    const savedBreeds = getBreeds();
    if (savedBreeds) {
      setBreeds(savedBreeds);
    }
  };

  const handleAdd = (values: { breed: string }) => {
    if (breeds.includes(values.breed)) {
      messageApi.error('该品种已存在');
      return;
    }
    const newBreeds = [...breeds, values.breed];
    setBreeds(newBreeds);
    saveBreeds(newBreeds);
    form.resetFields();
    messageApi.success('添加品种成功');
  };

  const handleDelete = (breed: string) => {
    showConfirm({
      title: '删除品种',
      content: `确定要删除品种"${breed}"吗？`,
      onOk: () => {
        const newBreeds = breeds.filter(b => b !== breed);
        setBreeds(newBreeds);
        saveBreeds(newBreeds);
        messageApi.success('删除品种成功');
      }
    });
  };

  return (
    <>
      {messageContextHolder}
      {modalContextHolder}
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>品种管理</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="breed"
                rules={[
                  { required: true, message: '请输入品种名称' },
                  { max: 50, message: '品种名称不能超过50个字符' }
                ]}
              >
                <Input placeholder="请输入品种名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                  添加品种
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <div style={{ marginTop: 16 }}>
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 8,
              cursor: 'pointer'
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <Typography.Text strong>品种列表</Typography.Text>
            <Button 
              type="text" 
              icon={expanded ? <UpOutlined /> : <DownOutlined />}
            />
          </div>
          {expanded && (
            <List
              dataSource={breeds}
              renderItem={breed => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      danger 
                      onClick={() => handleDelete(breed)}
                    >
                      删除
                    </Button>
                  ]}
                >
                  {breed}
                </List.Item>
              )}
            />
          )}
        </div>
      </Card>
    </>
  );
};

export default BreedSettings; 