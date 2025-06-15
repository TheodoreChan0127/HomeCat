/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, message, Upload } from 'antd';
import { DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { CatDbProxy } from '../../db/CatDbProxy';
import { TableName, TableInfo, dbTables } from '../../Types/database';
import { db } from '../../db/DBManager';

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
      const fileName = `${tableName}_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      messageApi.success('导出数据成功');
    } catch (error) {
      console.error('导出数据失败:', error);
      messageApi.error('导出数据失败');
    }
  };

  // 导出所有数据
  const handleExportAll = async () => {
    try {
      console.log('开始导出所有数据...');
      const data: Record<string, any[]> = {};
      const tables = Object.keys(dbTables) as TableName[];

      for (const table of tables) {
        console.log(`正在导出 ${table} 表数据...`);
        data[table] = await db.table(table).toArray();
        console.log(`${table} 表导出完成，共 ${data[table].length} 条记录`);
      }

      console.log('所有表数据导出完成，准备生成文件...');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `homecat_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log(`文件 ${fileName} 已生成并开始下载`);
      messageApi.success('导出所有数据成功');
    } catch (error) {
      console.error('导出所有数据失败:', error);
      messageApi.error('导出所有数据失败');
    }
  };

  // 导入数据
  const handleImport = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const tables = Object.keys(data) as TableName[];
          const importResults: { table: string; success: boolean; message: string }[] = [];

          // 逐个表进行导入
          for (const table of tables) {
            try {
              if (dbTables[table]) {
                await db.table(table).clear();
                await db.table(table).bulkAdd(data[table]);
                importResults.push({
                  table,
                  success: true,
                  message: `导入成功，共 ${data[table].length} 条记录`
                });
              } else {
                importResults.push({
                  table,
                  success: false,
                  message: '表不存在，跳过导入'
                });
              }
            } catch (error) {
              importResults.push({
                table,
                success: false,
                message: `导入失败：${error instanceof Error ? error.message : '未知错误'}`
              });
            }
          }

          // 显示导入结果
          const successCount = importResults.filter(r => r.success).length;
          const failCount = importResults.filter(r => !r.success).length;
          
          if (failCount === 0) {
            messageApi.success(`所有表导入成功，共 ${successCount} 个表`);
          } else {
            messageApi.warning(
              <div>
                <p>导入完成，但部分表导入失败：</p>
                <ul>
                  {importResults.map((result, index) => (
                    <li key={index} style={{ color: result.success ? '#52c41a' : '#ff4d4f' }}>
                      {result.table}: {result.message}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          // 刷新表信息
          loadTableInfo();
        } catch (error) {
          console.error('解析导入文件失败:', error);
          messageApi.error('解析导入文件失败，请确保文件格式正确');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('读取文件失败:', error);
      messageApi.error('读取文件失败');
    }
    return false;
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
      <div style={{ marginBottom: 16, display: 'flex', gap: '16px' }}>
        <Button type="primary" danger onClick={handleClearAll}>
          清空所有数据
        </Button>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={handleExportAll}
        >
          导出所有数据
        </Button>
        <Upload
          accept=".json"
          showUploadList={false}
          beforeUpload={handleImport}
        >
          <Button icon={<UploadOutlined />}>
            导入所有数据
          </Button>
        </Upload>
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