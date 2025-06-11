import React, { useEffect, useState } from 'react';
import { Card, Typography, Select, Spin, Row, Col, Statistic } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalysisModuleProps } from '../../Types/analysis';
import { WeightRecord } from '../../entity/WeightRecord';
import { CatDbProxy } from '../../db/CatDbProxy';
import { Cat } from '../../entity/Cat';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;

export function WeightAnalysis({ data }: AnalysisModuleProps) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取所有猫咪
  useEffect(() => {
    const fetchCats = async () => {
      const result = await CatDbProxy.getCats({
        currentPage: 1,
        itemsPerPage: 100,
        filters: {}
      });
      setCats(result.data);
      if (result.data.length > 0) {
        setSelectedCatId(result.data[0].id);
      }
    };
    fetchCats();
  }, []);

  // 获取选中猫咪的体重记录
  useEffect(() => {
    const fetchWeightRecords = async () => {
      if (selectedCatId) {
        setLoading(true);
        try {
          const records = await CatDbProxy.getWeightRecordsByCatId(selectedCatId);
          // 按日期排序
          const sortedRecords = records.sort((a, b) => 
            dayjs(a.weighDate).valueOf() - dayjs(b.weighDate).valueOf()
          );
          setWeightRecords(sortedRecords);
        } catch (error) {
          console.error('获取体重记录失败:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchWeightRecords();
  }, [selectedCatId]);

  // 转换数据格式
  const chartData = weightRecords.map(record => ({
    date: dayjs(record.weighDate).format('YYYY-MM-DD'),
    weight: record.weight
  }));

  // 计算统计数据
  const latestWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : 0;
  const weightChange = weightRecords.length > 1 
    ? (weightRecords[weightRecords.length - 1].weight - weightRecords[weightRecords.length - 2].weight).toFixed(2)
    : 0;
  const weightChangeType = Number(weightChange) > 0 ? 'increase' : 'decrease';

  return (
    <div className="weight-analysis">
      <Row gutter={[16, 16]}>
        {/* 标题和选择器 */}
        <Col span={24}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={4} className="m-0">体重趋势分析</Title>
              <Text type="secondary">追踪猫咪体重变化，关注健康状态</Text>
            </div>
            <Select
              style={{ width: 200 }}
              value={selectedCatId}
              onChange={setSelectedCatId}
              placeholder="选择猫咪"
            >
              {cats.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* 统计卡片 */}
        <Col span={24}>
          <Row gutter={16}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="当前体重"
                  value={latestWeight}
                  precision={2}
                  suffix="kg"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="体重变化"
                  value={Math.abs(Number(weightChange))}
                  precision={2}
                  suffix="kg"
                  valueStyle={{ color: weightChangeType === 'increase' ? '#3f8600' : '#cf1322' }}
                  prefix={weightChangeType === 'increase' ? '+' : '-'}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* 图表 */}
        <Col span={24}>
          <Card className="chart-card">
            {loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <Spin size="large" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                    label={{ 
                      value: '体重 (kg)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: '#666' }
                    }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #f0f0f0',
                      borderRadius: '4px'
                    }}
                    formatter={(value: number) => [`${value} kg`, '体重']}
                    labelFormatter={(label) => `日期: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#5468ff" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
} 