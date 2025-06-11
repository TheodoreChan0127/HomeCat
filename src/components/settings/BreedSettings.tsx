import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, List, Space, Modal, message, Typography, Row, Col } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getBreeds, saveBreeds } from '../../config/breeds';

const { Title } = Typography;

const BreedSettings: React.FC = () => {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [newBreed, setNewBreed] = useState('');
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [breedToDelete, setBreedToDelete] = useState<string>('');
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    loadBreeds();
  }, []);

  const loadBreeds = () => {
    const breedList = getBreeds();
    setBreeds(breedList);
  };

  const handleAddBreed = () => {
    if (!newBreed.trim()) {
      messageApi.warning('请输入品种名称');
      return;
    }
    if (breeds.includes(newBreed)) {
      messageApi.warning('该品种已存在');
      return;
    }
    const newBreeds = [...breeds, newBreed];
    setBreeds(newBreeds);
    saveBreeds(newBreeds);
    setNewBreed('');
    messageApi.success('添加品种成功');
  };

  const showDeleteModal = (breed: string) => {
    setBreedToDelete(breed);
    setIsModalOpen(true);
  };

  const handleDeleteOk = async () => {
    try {
      const newBreeds = breeds.filter(b => b !== breedToDelete);
      await saveBreeds(newBreeds);
      setBreeds(newBreeds);
      messageApi.success('删除品种成功');
    } catch (error) {
      console.error('删除品种失败:', error);
      messageApi.error('删除品种失败');
    }
    setIsModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Card>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 24 }}>品种管理</Title>
      
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="添加新品种" bordered={false}>
            <Form form={form} layout="vertical">
              <Form.Item label="品种名称">
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    value={newBreed}
                    onChange={e => setNewBreed(e.target.value)}
                    placeholder="请输入新品种名称"
                    onPressEnter={handleAddBreed}
                  />
                  <Button 
                    type="primary" 
                    onClick={handleAddBreed} 
                    icon={<PlusOutlined />}
                  >
                    添加
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="现有品种列表" bordered={false}>
            <List
              grid={{ gutter: 8, column: 6 }}
              dataSource={breeds}
              renderItem={breed => (
                <List.Item>
                  <Card 
                    hoverable
                    size="small"
                    bodyStyle={{ padding: '8px 12px' }}
                    actions={[
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => showDeleteModal(breed)}
                      >
                        删除
                      </Button>
                    ]}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{breed}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>猫咪品种</div>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="确认删除"
        open={isModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="确认"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要删除品种"{breedToDelete}"吗？此操作不可恢复！</p>
      </Modal>
    </Card>
  );
};

export default BreedSettings; 