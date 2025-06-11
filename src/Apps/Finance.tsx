/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState, useMemo } from 'react';
import { Card, Typography, Tabs, Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Popconfirm, message, Row, Col, Statistic } from 'antd';
import DashboardLayout from '../components/dashboard';
import { CatDbProxy } from '../db/CatDbProxy';
import { Purchase } from '../entity/Purchase';
import { GoodsSale } from '../entity/GoodsSale';
import { KittenSale } from '../entity/KittenSale';
import { Cat } from '../entity/Cat';
import dayjs from 'dayjs';
import PageTitle from '../components/PageTitle';
import { DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

function Finance() {
  const [messageApi, contextHolder] = message.useMessage();
  // 公共状态
  const [cats, setCats] = useState<Cat[]>([]);
  // 采购
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  // 销售
  const [goodsSales, setGoodsSales] = useState<GoodsSale[]>([]);
  const [goodsSaleModalOpen, setGoodsSaleModalOpen] = useState(false);
  // 小猫销售
  const [kittenSales, setKittenSales] = useState<KittenSale[]>([]);
  const [kittenSaleModalOpen, setKittenSaleModalOpen] = useState(false);

  // 表单
  const [purchaseForm] = Form.useForm();
  const [goodsSaleForm] = Form.useForm();
  const [kittenSaleForm] = Form.useForm();

  // 加载数据
  useEffect(() => {
    CatDbProxy.getCats({ currentPage: 1, itemsPerPage: 100, filters: {} }).then(res => setCats(res.data));
    CatDbProxy.getPurchases().then(setPurchases);
    CatDbProxy.getGoodsSales().then(setGoodsSales);
    CatDbProxy.getKittenSales().then(setKittenSales);
  }, []);

  // 采购表操作
  const handleAddPurchase = async () => {
    console.log('handleAddPurchase called');
    try {
      const values = await purchaseForm.validateFields();
      console.log('Form validated values:', values);

      // 强制转换isSingleCat为布尔值，并从values中移除id
      const { id, ...restValues } = values; // 移除id字段
      const isSingleCat = restValues.isSingleCat === true || restValues.isSingleCat === 'true';
      
      if (isSingleCat && !restValues.catId) {
        messageApi.error('请选择对应猫咪');
        return;
      }
      const purchase: Omit<Purchase, 'id'> = {
        ...restValues, // 传递不含id的字段
        isSingleCat,
        catId: isSingleCat ? restValues.catId : undefined,
        amount: Number(restValues.amount),
        purchaseDate: restValues.purchaseDate.format('YYYY-MM-DD'),
      };
      console.log('Prepared purchase object for proxy:', purchase);

      await CatDbProxy.addPurchase(purchase as Purchase);
      setPurchases(await CatDbProxy.getPurchases());
      CatDbProxy.getCats({ currentPage: 1, itemsPerPage: 100, filters: {} }).then(res => setCats(res.data));
      setPurchaseModalOpen(false);
      purchaseForm.resetFields();
      messageApi.success('添加成功');
    } catch (error: any) {
      console.error('添加采购失败:', error); 
      let errorMessage = '未知错误';
      if (error && error.message) {
        errorMessage = error.message;
      } else if (error && error.errorFields && error.errorFields.length > 0) {
        errorMessage = error.errorFields.map((field: any) => field.errors.join(', ')).join('; ');
      }
      messageApi.error(`添加失败: ${errorMessage}`);
    }
  };
  const handleDeletePurchase = async (id: number) => {
    try {
      await CatDbProxy.deletePurchase(id);
      setPurchases(await CatDbProxy.getPurchases());
      CatDbProxy.getCats({ currentPage: 1, itemsPerPage: 100, filters: {} }).then(res => setCats(res.data));
      messageApi.success('删除成功');
    } catch (error) {
      console.error('删除采购失败:', error);
      messageApi.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  const openPurchaseModal = () => {
    setPurchaseModalOpen(true);
    purchaseForm.resetFields();
    purchaseForm.setFieldsValue({
      purchaseDate: dayjs(),
      isSingleCat: false
    });
  };

  // 物品销售表操作
  const handleAddGoodsSale = async () => {
    try {
      const values = await goodsSaleForm.validateFields();
      const { id, ...restValues } = values; // 移除id字段
      const sale: Omit<GoodsSale, 'id'> = {
        ...restValues,
        amount: Number(restValues.amount),
        saleDate: restValues.saleDate.format('YYYY-MM-DD'),
      };
      await CatDbProxy.addGoodsSale(sale as GoodsSale); // 类型断言
      setGoodsSales(await CatDbProxy.getGoodsSales());
      setGoodsSaleModalOpen(false);
      goodsSaleForm.resetFields();
      messageApi.success('添加成功');
    } catch (error) {
      console.error('添加物品销售失败:', error);
      messageApi.error(`添加失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  const handleDeleteGoodsSale = async (id: number) => {
    try {
      await CatDbProxy.deleteGoodsSale(id);
      setGoodsSales(await CatDbProxy.getGoodsSales());
      messageApi.success('删除成功');
    } catch (error) {
      console.error('删除物品销售失败:', error);
      messageApi.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  const openGoodsSaleModal = () => {
    setGoodsSaleModalOpen(true);
    goodsSaleForm.resetFields();
    goodsSaleForm.setFieldsValue({ saleDate: dayjs() });
  };

  // 小猫销售表操作
  const handleAddKittenSale = async () => {
    try {
      const values = await kittenSaleForm.validateFields();
      const { id, ...restValues } = values; // 移除id字段
      const sale: Omit<KittenSale, 'id'> = {
        ...restValues,
        amount: Number(restValues.amount),
        saleDate: restValues.saleDate.format('YYYY-MM-DD'),
      };
      await CatDbProxy.addKittenSale(sale as KittenSale); // 类型断言
      setKittenSales(await CatDbProxy.getKittenSales());
      setKittenSaleModalOpen(false);
      kittenSaleForm.resetFields();
      messageApi.success('添加成功');
    } catch (error) {
      messageApi.error(`添加失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  const handleDeleteKittenSale = async (id: number) => {
    try {
      await CatDbProxy.deleteKittenSale(id);
      setKittenSales(await CatDbProxy.getKittenSales());
      messageApi.success('删除成功');
    } catch (error) {
      console.error('删除小猫销售失败:', error);
      messageApi.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 表格列
  const purchaseColumns = [
    { title: '采购事项', dataIndex: 'item' },
    { title: '金额', dataIndex: 'amount' },
    { title: '是否单猫支出', dataIndex: 'isSingleCat', render: (v: boolean) => v ? '是' : '否' },
    { title: '对应猫咪', dataIndex: 'catId', render: (id: number) => cats.find(c => c.id === id)?.name || '-' },
    { title: '采购日期', dataIndex: 'purchaseDate' },
    { title: '操作', dataIndex: 'op', render: (_: any, r: Purchase) => (
      <Popconfirm title="确认删除？" onConfirm={() => handleDeletePurchase(r.id)}><Button danger size="small">删除</Button></Popconfirm>
    ) }
  ];
  const goodsSaleColumns = [
    { title: '销售事项', dataIndex: 'item' },
    { title: '金额', dataIndex: 'amount' },
    { title: '销售日期', dataIndex: 'saleDate' },
    { title: '操作', dataIndex: 'op', render: (_: any, r: GoodsSale) => (
      <Popconfirm title="确认删除？" onConfirm={() => handleDeleteGoodsSale(r.id)}><Button danger size="small">删除</Button></Popconfirm>
    ) }
  ];
  const kittenSaleColumns = [
    { title: '猫咪', dataIndex: 'kittenId', render: (id: number) => cats.find(c => c.id === id)?.name || '-' },
    { title: '金额', dataIndex: 'amount' },
    { title: '销售日期', dataIndex: 'saleDate' },
    { title: '操作', dataIndex: 'op', render: (_: any, r: KittenSale) => (
      <Popconfirm title="确认删除？" onConfirm={() => handleDeleteKittenSale(r.id)}><Button danger size="small">删除</Button></Popconfirm>
    ) }
  ];

  // 总览统计逻辑，依赖数据变化自动刷新
  const overviewStats = useMemo(() => {
    const goodsSalesTotal = goodsSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    const totalIncome = cats.reduce((sum, cat) => sum + (cat.totalIncome || 0), 0) + goodsSalesTotal;
    const totalExpense = cats.reduce((sum, cat) => sum + (cat.totalExpense || 0), 0);
    const currentMonth = dayjs().format('YYYY-MM');
    const kittenSalesThisMonth = kittenSales.filter(sale => sale.saleDate.startsWith(currentMonth));
    const kittenSalesCountThisMonth = kittenSalesThisMonth.length;
    // 当月单猫支出最大
    const singleCatPurchasesThisMonth = purchases.filter(p => p.isSingleCat && p.purchaseDate.startsWith(currentMonth));
    const catExpenseMap: Record<number, number> = {};
    singleCatPurchasesThisMonth.forEach(p => {
      if (!catExpenseMap[p.catId!]) catExpenseMap[p.catId!] = 0;
      catExpenseMap[p.catId!] += p.amount;
    });
    let maxExpenseCatId: number | null = null, maxExpense = 0;
    Object.entries(catExpenseMap).forEach(([catId, amount]) => {
      if (amount > maxExpense) {
        maxExpense = amount;
        maxExpenseCatId = Number(catId);
      }
    });
    const maxExpenseCat = cats.find(c => c.id === maxExpenseCatId);
    // 当月单猫收益最大
    const kittenSalesByCat: Record<number, number> = {};
    kittenSalesThisMonth.forEach(sale => {
      const kitten = cats.find(c => c.id === sale.kittenId);
      if (kitten) {
        // 父母各分50%
        if (kitten.fatherId) {
          kittenSalesByCat[kitten.fatherId] = (kittenSalesByCat[kitten.fatherId] || 0) + sale.amount / 2;
        }
        if (kitten.motherId) {
          kittenSalesByCat[kitten.motherId] = (kittenSalesByCat[kitten.motherId] || 0) + sale.amount / 2;
        }
      }
    });
    let maxIncomeCatId: number | null = null, maxIncome = 0;
    Object.entries(kittenSalesByCat).forEach(([catId, amount]) => {
      if (amount > maxIncome) {
        maxIncome = amount;
        maxIncomeCatId = Number(catId);
      }
    });
    const maxIncomeCat = cats.find(c => c.id === maxIncomeCatId);
    return {
      totalExpense,
      totalIncome,
      kittenSalesCountThisMonth,
      maxExpenseCat,
      maxExpense,
      maxIncomeCat,
      maxIncome
    };
  }, [cats, purchases, kittenSales, goodsSales]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {contextHolder}
        <PageTitle 
          title="收支管理" 
          subtitle="管理猫舍的收支记录和统计"
          icon={<DollarOutlined />}
        />

        {/* 总览数据 */}
        <Card className="mb-6">
          <Title level={4}>总览数据</Title>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Statistic title="总支出" value={overviewStats.totalExpense} precision={2} suffix="元" />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="总收入" value={overviewStats.totalIncome} precision={2} suffix="元" />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="本月售出小猫数量" value={overviewStats.kittenSalesCountThisMonth} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="本月单猫支出最大" value={overviewStats.maxExpenseCat ? `${overviewStats.maxExpenseCat.name}（${overviewStats.maxExpense.toFixed(2)}元）` : '无'} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="本月单猫收益最大" value={overviewStats.maxIncomeCat ? `${overviewStats.maxIncomeCat.name}（${overviewStats.maxIncome.toFixed(2)}元）` : '无'} />
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 记录展示 */}
        <Card>
          <Title level={4}>收支记录</Title>
          <Tabs defaultActiveKey="1">
            <TabPane tab="物品采购" key="1">
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" onClick={() => setPurchaseModalOpen(true)}>
                  添加采购记录
                </Button>
              </div>
              <Table
                dataSource={purchases}
                columns={purchaseColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
            <TabPane tab="物品销售" key="2">
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" onClick={() => setGoodsSaleModalOpen(true)}>
                  添加销售记录
                </Button>
              </div>
              <Table
                dataSource={goodsSales}
                columns={goodsSaleColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
            <TabPane tab="小猫销售" key="3">
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" onClick={() => setKittenSaleModalOpen(true)}>
                  添加销售记录
                </Button>
              </div>
              <Table
                dataSource={kittenSales}
                columns={kittenSaleColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* 采购添加表单 */}
        <Modal open={purchaseModalOpen} title="添加采购" onCancel={() => setPurchaseModalOpen(false)} onOk={handleAddPurchase} destroyOnClose>
          <Form form={purchaseForm} layout="vertical">
            <Form.Item label="采购事项" name="item" rules={[{ required: true, message: '请输入事项' }]}><Input /></Form.Item>
            <Form.Item label="金额" name="amount" rules={[{ required: true, message: '请输入金额' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="是否单猫支出" name="isSingleCat">
              <Select>
                <Option value={true}>是</Option>
                <Option value={false}>否</Option>
              </Select>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isSingleCat !== curr.isSingleCat}>
              {({ getFieldValue }) =>
                getFieldValue('isSingleCat') === true || getFieldValue('isSingleCat') === 'true' ? (
                  <Form.Item label="对应猫咪" name="catId" rules={[{ required: true, message: '请选择猫咪' }]}> 
                    <Select showSearch filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}>
                      {cats.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item>
            <Form.Item label="采购日期" name="purchaseDate" rules={[{ required: true, message: '请选择日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* 物品销售添加表单 */}
        <Modal open={goodsSaleModalOpen} title="添加销售" onCancel={() => setGoodsSaleModalOpen(false)} onOk={handleAddGoodsSale} destroyOnClose>
          <Form form={goodsSaleForm} layout="vertical">
            <Form.Item label="销售事项" name="item" rules={[{ required: true, message: '请输入事项' }]}><Input /></Form.Item>
            <Form.Item label="金额" name="amount" rules={[{ required: true, message: '请输入金额' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="销售日期" name="saleDate" rules={[{ required: true, message: '请选择日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* 小猫销售添加表单 */}
        <Modal open={kittenSaleModalOpen} title="添加小猫销售" onCancel={() => setKittenSaleModalOpen(false)} onOk={handleAddKittenSale} destroyOnClose>
          <Form form={kittenSaleForm} layout="vertical">
            <Form.Item label="猫咪" name="kittenId" rules={[{ required: true, message: '请选择猫咪' }]}> 
              <Select showSearch filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}>
                {cats.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="金额" name="amount" rules={[{ required: true, message: '请输入金额' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="销售日期" name="saleDate" rules={[{ required: true, message: '请选择日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default Finance; 