import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, message } from 'antd';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { CatDbProxy } from '../../db/CatDbProxy';
import { TableName, TableInfo } from '../../Types/database';

const DatabaseSettings: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableToClear, setTableToClear] = useState<TableName | null>(null);

  useEffect(() => {
    loadTableInfo();
  }, []);

  const loadTableInfo = async () => {
    setLoading(true);
    try {
      const tableInfo = await CatDbProxy.getTableInfo();
      setTables(tableInfo);
    } catch (error) {
      console.error('加载表信息失败:', error);
      messageApi.error('加载表信息失败');
    }
    setLoading(false);
  };

  const handleClearTable = async (tableName: TableName) => {
    setTableToClear(tableName);
    setIsModalOpen(true);
  };

  const handleClearAll = () => {
    setTableToClear(null);
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      if (tableToClear) {
        await CatDbProxy.clearTable(tableToClear);
        messageApi.success(`清空 ${tableToClear} 表成功`);
      } else {
        await CatDbProxy.clearAllTables();
        messageApi.success('清空所有表成功');
      }
      loadTableInfo();
    } catch (error) {
      console.error('清空表失败:', error);
      messageApi.error('清空表失败');
    }
    setIsModalOpen(false);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleDumpTable = async (tableName: TableName) => {
    try {
      const data = await CatDbProxy.dumpTable(tableName);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      messageApi.success(`导出 ${tableName} 表数据成功`);
    } catch (error) {
      console.error('导出表数据失败:', error);
      messageApi.error('导出表数据失败');
    }
  };

  const columns = [
    {
      title: '表名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '记录数',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TableInfo) => (
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDumpTable(record.name as TableName)}
          >
            导出数据
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleClearTable(record.name as TableName)}
          >
            清空表
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="数据库管理">
      {contextHolder}
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" danger onClick={handleClearAll}>
          清空所有数据
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={tables}
        rowKey="name"
        loading={loading}
        pagination={false}
      />
      <Modal
        title={tableToClear ? `确认清空 ${tableToClear} 表` : '确认清空所有数据'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确认"
        cancelText="取消"
        okType="danger"
      >
        <p>
          {tableToClear 
            ? `确定要清空 ${tableToClear} 表的所有数据吗？此操作不可恢复！`
            : '确定要清空所有表的数据吗？此操作不可恢复！'
          }
        </p>
      </Modal>
    </Card>
  );
};

export default DatabaseSettings; 