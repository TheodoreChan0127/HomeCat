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
      console.log(`开始导出 ${tableName} 表数据...`);
      const data = await CatDbProxy.dumpTable(tableName);
      console.log(`${tableName} 表数据获取完成，共 ${data.length} 条记录`);

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `${tableName}_${new Date().toISOString().split('T')[0]}.json`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log(`文件 ${fileName} 已生成并开始下载`);
      messageApi.success(`导出 ${tableName} 表数据成功`);
    } catch (error) {
      console.error('导出表数据失败:', error);
      messageApi.error('导出表数据失败');
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
      console.log('开始导入数据...');
      console.log('文件名:', file.name);
      console.log('文件大小:', file.size, 'bytes');

      const text = await file.text();
      console.log('文件读取完成，开始解析 JSON...');
      const data = JSON.parse(text) as Record<string, any[]>;
      console.log('JSON 解析完成，开始验证数据...');

      // 验证数据完整性
      const requiredTables = Object.keys(dbTables) as TableName[];

      // 检查所有必需的表是否存在
      console.log('验证必需的表是否存在...');
      for (const table of requiredTables) {
        if (!(table in data)) {
          console.error(`缺少必需的表: ${table}`);
          throw new Error(`缺少必需的表: ${table}`);
        }
        console.log(`表 ${table} 存在，包含 ${data[table].length} 条记录`);
      }

      // 验证外键关系
      console.log('验证外键关系...');
      const catIds = new Set(data.cats.map((cat: any) => cat.id));
      console.log(`猫咪表共有 ${catIds.size} 条记录`);
      
      // 验证所有关联表的外键
      const relatedTables = ['externalDewormings', 'internalDewormings', 'illnesses', 'pregnancies', 'vaccinationRecords', 'weightRecords', 'kittenSales'];
      for (const table of relatedTables) {
        console.log(`验证 ${table} 表的外键关系...`);
        let invalidCount = 0;
        for (const record of data[table]) {
          if (!catIds.has(record.catId)) {
            invalidCount++;
            console.error(`${table} 表中发现无效的 catId: ${record.catId}`);
          }
        }
        if (invalidCount > 0) {
          throw new Error(`${table} 表中存在 ${invalidCount} 条无效的 catId 记录`);
        }
        console.log(`${table} 表外键验证通过`);
      }

      // 导入数据
      console.log('开始导入数据到数据库...');
      await db.transaction('rw', Object.keys(data), async () => {
        for (const [table, records] of Object.entries(data)) {
          console.log(`清空 ${table} 表...`);
          await db.table(table).clear();
          if (records && records.length > 0) {
            console.log(`向 ${table} 表导入 ${records.length} 条记录...`);
            await db.table(table).bulkAdd(records);
            console.log(`${table} 表导入完成`);
          } else {
            console.log(`${table} 表没有记录需要导入`);
          }
        }
      });

      console.log('所有数据导入完成');
      messageApi.success('导入数据成功');
      loadTableInfo();
    } catch (error) {
      console.error('导入数据失败:', error);
      messageApi.error(`导入数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    return false; // 阻止自动上传
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
            导入数据
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