import React, { useEffect, useState } from 'react';
import { Card, Typography, Select, Spin, Row, Col, Statistic } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalysisModuleProps } from '../../Types/analysis';
import { CatDbProxy } from '../../db/CatDbProxy';
import { MonthlyStats } from '../../entity/MonthlyStats';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;

export function FinanceAnalysis({ data }: AnalysisModuleProps) {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(dayjs().format('YYYY-MM'));
  const [loading, setLoading] = useState(false);

  // 生成最近12个月的年月选项
  const generateYearMonthOptions = () => {
    const options = [];
    const current = dayjs();
    for (let i = 0; i < 12; i++) {
      const date = current.subtract(i, 'month');
      options.push({
        value: date.format('YYYY-MM'),
        label: date.format('YYYY年MM月')
      });
    }
    return options;
  };

  // 获取月度统计数据
  useEffect(() => {
    const fetchMonthlyStats = async () => {
      setLoading(true);
      try {
        const stats = await CatDbProxy.getMonthlyStats();
        // 过滤出最近12个月的数据
        const recentStats = stats.filter(stat => {
          const statDate = `${stat.year}-${String(stat.month).padStart(2, '0')}`;
          return dayjs(statDate).isAfter(dayjs().subtract(12, 'month'));
        });
        setMonthlyStats(recentStats);
      } catch (error) {
        console.error('获取月度统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyStats();
  }, []);

  // 转换数据格式
  const chartData = monthlyStats.map(stats => ({
    month: `${stats.year}-${String(stats.month).padStart(2, '0')}`,
    income: stats.totalIncome,
    expense: stats.totalExpense,
    kittenCount: stats.kittenCount
  })).sort((a, b) => a.month.localeCompare(b.month));

  // 计算统计数据
  const currentMonthStats = monthlyStats.find(stats => 
    `${stats.year}-${String(stats.month).padStart(2, '0')}` === selectedYearMonth
  );

  const totalIncome = currentMonthStats?.totalIncome || 0;
  const totalExpense = currentMonthStats?.totalExpense || 0;
  const totalKittenCount = currentMonthStats?.kittenCount || 0;

  return (
    <div className="finance-analysis">
      <Row gutter={[16, 16]}>
        {/* 标题和选择器 */}
        <Col span={24}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={4} className="m-0">财务分析</Title>
              <Text type="secondary">追踪猫舍收支情况，关注经营状况</Text>
            </div>
            <Select
              style={{ width: 150 }}
              value={selectedYearMonth}
              onChange={setSelectedYearMonth}
              placeholder="选择年月"
            >
              {generateYearMonthOptions().map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* 统计卡片 */}
        <Col span={24}>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="本月收入"
                  value={totalIncome}
                  precision={2}
                  suffix="元"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="本月支出"
                  value={totalExpense}
                  precision={2}
                  suffix="元"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="本月售出小猫数"
                  value={totalKittenCount}
                  suffix="只"
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
                    dataKey="month" 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#666"
                    tick={{ fill: '#666' }}
                    label={{ 
                      value: '金额 (元)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: '#666' }
                    }} 
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#666"
                    tick={{ fill: '#666' }}
                    label={{ 
                      value: '数量 (只)', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { fill: '#666' }
                    }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #f0f0f0',
                      borderRadius: '4px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'kittenCount') {
                        return [`${value} 只`, '售出小猫数量'];
                      }
                      return [`${value} 元`, name === 'income' ? '收入' : '支出'];
                    }}
                    labelFormatter={(label) => `月份: ${label}`}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="income" 
                    name="income"
                    stroke="#52c41a" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="expense" 
                    name="expense"
                    stroke="#ff4d4f" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="kittenCount" 
                    name="kittenCount"
                    stroke="#1890ff" 
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