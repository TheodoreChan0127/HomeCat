import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Space, Typography, Empty, Select, Pagination } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { Todo } from '../entity/Todo';
import { TodoService } from '../services/TodoService';
import { CatDbProxy } from '../db/CatDbProxy';
import { useMessage } from '../hooks/useMessage';
import { Cat } from '../entity/Cat';
import { WeightRecordModal } from './records/WeightRecordModal';
import { VaccinationModal } from './records/VaccinationModal';
import { DewormModal } from './records/DewormModal';
import { PregnancyModal } from './records/PregnancyModal';

const { Text } = Typography;
const { Option } = Select;

export const ReminderTodoView: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalTitle, setModalTitle] = useState('');
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const { showSuccess, showError } = useMessage();
  const todoService = TodoService.getInstance();
  const pageSize = 5;

  // 根据TODO内容判断类型并显示对应的记录输入表单
  const showRecordInputModal = (todo: Todo) => {
    const content = todo.content;
    setCurrentTodo(todo);

    if (content.includes('[称重提醒]')) {
      setModalTitle('体重记录');
    } else if (content.includes('[疫苗提醒]')) {
      setModalTitle('疫苗记录');
    } else if (content.includes('[体外驱虫提醒]')) {
      setModalTitle('体外驱虫记录');
    } else if (content.includes('[体内驱虫提醒]')) {
      setModalTitle('体内驱虫记录');
    }  else {
      // 对于其他类型的TODO，直接完成
      handleCompleteTodo(todo.id);
      return;
    }
    setModalVisible(true);
  };

  // 处理记录表单提交
  const handleRecordSubmit = async () => {
    if (currentTodo) {
      await handleCompleteTodo(currentTodo.id);
      setModalVisible(false);
      setCurrentTodo(null);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 获取所有猫咪
      const catsResult = await CatDbProxy.getCats({ currentPage: 1, itemsPerPage: 100, filters: {} });
      setCats(catsResult.data);

      // 获取TODO
      const pendingTodos = await todoService.getPendingTodos();
      setTodos(pendingTodos);
    } catch (error) {
      console.error('加载TODO失败:', error);
      showError('加载TODO失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteTodo = async (todoId: number) => {
    try {
      await todoService.completeTodo(todoId);
      showSuccess('待办事项已完成');
      await loadData();
    } catch (error) {
      console.error('完成TODO失败:', error);
      showError('完成待办事项失败');
    }
  };

  // 获取有TODO的猫咪列表
  const getCatsWithTodos = () => {
    const catIdsWithTodos = new Set(todos.map(todo => todo.catId));
    return cats.filter(cat => catIdsWithTodos.has(cat.id));
  };

  // 根据筛选条件获取当前页的TODO
  const getCurrentPageTodos = () => {
    let filteredTodos = todos;
    
    // 按猫咪筛选，如果选择了猫咪才进行筛选
    if (selectedCatId !== null) {
      filteredTodos = filteredTodos.filter(todo => todo.catId === selectedCatId);
    }

    // 计算分页
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTodos.slice(startIndex, endIndex);
  };

  // 获取总页数
  const getTotalPages = () => {
    let filteredTodos = todos;
    if (selectedCatId !== null) {
      filteredTodos = filteredTodos.filter(todo => todo.catId === selectedCatId);
    }
    return Math.ceil(filteredTodos.length / pageSize);
  };

  // 处理猫咪选择变化
  const handleCatChange = (value: number | undefined) => {
    setSelectedCatId(value || null);  // 将 undefined 转换为 null
    setCurrentPage(1); // 重置到第一页
  };

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 渲染记录输入表单
  const renderRecordForm = () => {
    if (!currentTodo) return null;

    const content = currentTodo.content;
    const catId = currentTodo.catId;

    if (content.includes('[称重提醒]')) {
      return (
        <WeightRecordModal
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setCurrentTodo(null);
          }}
          onSuccess={handleRecordSubmit}
          catId={catId}
        />
      );
    } else if (content.includes('[疫苗提醒]')) {
      return (
        <VaccinationModal
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setCurrentTodo(null);
          }}
          onSuccess={handleRecordSubmit}
          catId={catId}
        />
      );
    } else if (content.includes('[体外驱虫提醒]')) {
      return (
        <DewormModal
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setCurrentTodo(null);
          }}
          onSuccess={handleRecordSubmit}
          title="体外驱虫"
          apiMethod={CatDbProxy.addExternalDeworming}
          catId={catId}
        />
      );
    } else if (content.includes('[体内驱虫提醒]')) {
      return (
        <DewormModal
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setCurrentTodo(null);
          }}
          onSuccess={handleRecordSubmit}
          title="体内驱虫"
          apiMethod={CatDbProxy.addInternalDeworming}
          catId={catId}
        />
      );
    } else if (content.includes('[预产提醒]')) {
      return (
        <PregnancyModal
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setCurrentTodo(null);
          }}
          onSuccess={handleRecordSubmit}
          catId={catId}
        />
      );
    }
    return null;
  };

  return (
    <>
      <Card 
        title="待办事项" 
        loading={loading}
        extra={
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="选择猫咪（默认显示全部）"
              allowClear
              onChange={handleCatChange}
              value={selectedCatId}
            >
              {getCatsWithTodos().map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Space>
        }
      >
        {getCurrentPageTodos().length > 0 ? (
          <>
            <List
              dataSource={getCurrentPageTodos()}
              renderItem={(todo) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => showRecordInputModal(todo)}
                    >
                      完成
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text>{todo.content}</Text>
                        {todo.catId && (
                          <Tag color="blue">
                            {cats.find(cat => cat.id === todo.catId)?.name || '未知猫咪'}
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space>
                        <Tag color="orange">待处理</Tag>
                        <Text type="secondary">
                          创建时间：{new Date(todo.created_at).toLocaleString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Pagination
                current={currentPage}
                total={getTotalPages() * pageSize}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <Empty description="暂无待办事项" />
        )}
      </Card>

      {renderRecordForm()}
    </>
  );
}; 