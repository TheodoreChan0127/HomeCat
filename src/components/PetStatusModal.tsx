/* eslint-disable @typescript-eslint/no-unused-vars */
import { Cat } from '../entity/Cat'
import { CatDbProxy } from '../db/CatDbProxy'
import React, { JSX, useEffect, useState } from 'react'
import { Button, Tabs, Space,List, Spin, Modal } from 'antd'
import { WeightRecordModal} from '../components/records/WeightRecordModal';
import { VaccinationModal } from '../components/records/VaccinationModal';
import { DewormModal } from '../components/records/DewormModal';
import { PregnancyModal } from './records/PregnancyModal';
import { WeightRecord } from '../entity/WeightRecord';
import { VaccinationRecord } from '../entity/VaccinationRecord';
import { ExternalDeworming } from '../entity/ExternalDeworming';
import { InternalDeworming } from '../entity/InternalDeworming';
import { Pregnant } from '../entity/Pregnant';
import { IllnessRecordModal } from './records/IllnessRecordModal';
import { Illness } from '../entity/Illness';

interface PetStatusModalProps {
  visible: boolean
  onCancel: () => void
  cat: Cat | null
}

// Remove duplicate handleSuccess declaration
function PetStatusModal({ visible, onCancel, cat }: PetStatusModalProps): JSX.Element {

  const [activeTab, setActiveTab] = useState('weight');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showVaccineForm, setShowVaccineForm] = useState(false);
  const [showExternalDewormForm, setShowExternalDewormForm] = useState(false);
  const [showInternalDewormForm, setShowInternalDewormForm] = useState(false);
  const [showPregnancyForm, setShowPregnancyForm] = useState(false);

  // 修改状态管理为独立实体集合
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [externalDewormings, setExternalDewormings] = useState<ExternalDeworming[]>([]);
  const [internalDewormings, setInternalDewormings] = useState<InternalDeworming[]>([]);
  const [pregnancies, setPregnancies] = useState<Pregnant[]>([]);
  const [illnessRecords, setIllnessRecords] = useState<Illness[]>([]);
  const [showIllnessForm, setShowIllnessForm] = useState(false);
  // Remove unused status state
  const [loading, setLoading] = useState(false);

  const [editingRecord, setEditingRecord] = useState<{ type: string; data: any } | null>(null);

  const handleEditWeight = (record: WeightRecord) => {
    setEditingRecord({ type: 'weight', data: record });
    setShowWeightForm(true);
  };

  // 添加疫苗记录编辑方法
const handleEditVaccine = (record: VaccinationRecord) => {
  setEditingRecord({ type: 'vaccine', data: record });
  setShowVaccineForm(true);
};

// 添加体外驱虫记录编辑方法
const handleEditExternalDeworm = (record: ExternalDeworming) => {
  setEditingRecord({ type: 'extDeworm', data: record });
  setShowExternalDewormForm(true);
};

// 添加体内驱虫记录编辑方法
const handleEditInternalDeworm = (record: InternalDeworming) => {
  setEditingRecord({ type: 'intDeworm', data: record });
  setShowInternalDewormForm(true);
};

// 添加怀孕记录编辑方法
const handleEditPregnancy = (record: Pregnant) => {
  setEditingRecord({ type: 'pregnancy', data: record });
  setShowPregnancyForm(true);
};

// 新增编辑方法
const handleEditIllness = (record: Illness) => {
  setEditingRecord({ type: 'illness', data: record });
  setShowIllnessForm(true);
};  

const handleDelete = async (type: string, id: number) => {
  try {
    setLoading(true);
    switch(type) {
      case 'weight':
        await CatDbProxy.deleteWeightRecord(id);
        break;
      case 'vaccine':
        await CatDbProxy.deleteVaccinationRecord(id);
        break;
      case 'extDeworm':
        await CatDbProxy.deleteExternalDeworming(id);
        break;
      case 'intDeworm':
        await CatDbProxy.deleteInternalDeworming(id);
        break;
      case 'pregnancy':
        await CatDbProxy.deletePregnancy(id);
        break;
      case 'illness':
        await CatDbProxy.deleteIllness(id);
        break;
      default:
        throw new Error('未知类型');
    }
    handleSuccess(); // 刷新数据
  } catch (error) {
    console.error('删除失败:', error);
  } finally {
    setLoading(false);
  }
};

// 初始化
useEffect(() => {
  if (visible && cat) {
    console.log('获取数据:', cat.id);
    setLoading(true);
    Promise.all([
      CatDbProxy.getWeightRecordsByCatId(cat.id),
      CatDbProxy.getVaccinationsByCatId(cat.id),
      CatDbProxy.getExternalDewormingsByCatId(cat.id),
      CatDbProxy.getInternalDewormingsByCatId(cat.id),
      CatDbProxy.getPregnanciesByCatId(cat.id),
      CatDbProxy.getIllnessesByCatId(cat.id)
    ]).then(([weights, vaccines, extDeworm, intDeworm, preg, illnesses]) => {

      console.log('成功获取数据:', weights, vaccines, extDeworm, intDeworm, preg);
      // 统一排序并更新状态（与初始化逻辑一致）
      setWeightRecords(weights.sort((a, b) => 
        new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime()
      ))
      setVaccinationRecords(vaccines.sort((a, b) => 
        new Date(b.injectionDate).getTime() - new Date(a.injectionDate).getTime()
      ))
      setExternalDewormings(extDeworm.sort((a, b) => 
        new Date(b.dewormingDate).getTime() - new Date(a.dewormingDate).getTime()
      ))
      setInternalDewormings(intDeworm.sort((a, b) => 
        new Date(b.dewormingDate).getTime() - new Date(a.dewormingDate).getTime()
      ))
      setPregnancies(preg.sort((a, b) => 
        new Date(b.expectedDeliveryDate).getTime() - new Date(a.expectedDeliveryDate).getTime()
      ))
      setIllnessRecords(illnesses.sort((a, b) => 
        new Date(b.id).getTime() - new Date(a.id).getTime()  // 按记录时间排序（根据实际字段调整）
      ))
    }).catch(console.error)
    .finally(() => setLoading(false));
  }
}, [visible, cat]);

  // Single handleSuccess function
  const handleSuccess = () => {
    if (!cat) return  // 提前处理 cat 为 null 的情况
  
    setLoading(true)
    Promise.all([
      CatDbProxy.getWeightRecordsByCatId(cat.id),
      CatDbProxy.getVaccinationsByCatId(cat.id),
      CatDbProxy.getExternalDewormingsByCatId(cat.id),
      CatDbProxy.getInternalDewormingsByCatId(cat.id),
      CatDbProxy.getPregnanciesByCatId(cat.id),
      CatDbProxy.getIllnessesByCatId(cat.id),  // 补充疾病记录获取
    ])
      .then(([weights, vaccines, extDeworm, intDeworm, preg, illnesses]) => {
        // 统一排序并更新状态（与初始化逻辑一致）
        setWeightRecords(weights.sort((a, b) => 
          new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime()
        ))
        setVaccinationRecords(vaccines.sort((a, b) => 
          new Date(b.injectionDate).getTime() - new Date(a.injectionDate).getTime()
        ))
        setExternalDewormings(extDeworm.sort((a, b) => 
          new Date(b.dewormingDate).getTime() - new Date(a.dewormingDate).getTime()
        ))
        setInternalDewormings(intDeworm.sort((a, b) => 
          new Date(b.dewormingDate).getTime() - new Date(a.dewormingDate).getTime()
        ))
        setPregnancies(preg.sort((a, b) => 
          new Date(b.expectedDeliveryDate).getTime() - new Date(a.expectedDeliveryDate).getTime()
        ))
        setIllnessRecords(illnesses.sort((a, b) => 
          new Date(b.id).getTime() - new Date(a.id).getTime()  // 按记录时间排序（根据实际字段调整）
        ))
      })
      .catch(console.error)
      .finally(() => setLoading(false))  // 确保加载状态关闭
  }
  
  
  return (
    <Modal
      title="健康状态管理"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnHidden  // 替换destroyOnClose
    >
    <WeightRecordModal
        visible={showWeightForm}
        onCancel={() => setShowWeightForm(false)}
        onSuccess={handleSuccess}
        catId={cat?.id}
        editingRecord={editingRecord?.type === 'weight' ? editingRecord.data : undefined} // 新增
    />
    
    <VaccinationModal
        visible={showVaccineForm}
        onCancel={() => setShowVaccineForm(false)}
        onSuccess={handleSuccess}
        catId={cat?.id}
        editingRecord={editingRecord?.type === 'vaccine' ? editingRecord.data : undefined} // 新增
    />
    <DewormModal
        title="体外驱虫记录"
        visible={showExternalDewormForm}
        onCancel={() => setShowExternalDewormForm(false)}
        onSuccess={handleSuccess}
        apiMethod={async (data) => {
            // 根据是否存在编辑记录选择更新/添加接口
            if (editingRecord?.type === 'extDeworm') {
                await CatDbProxy.updateExternalDeworming(data);
            } else {
                await CatDbProxy.addExternalDeworming(data);
            }
        }}
        catId={cat?.id}
        editingRecord={editingRecord?.type === 'extDeworm' ? editingRecord.data : undefined} // 新增：传递编辑记录
    />
    <DewormModal
        title="体内驱虫记录"
        visible={showInternalDewormForm}
        onCancel={() => setShowInternalDewormForm(false)}
        onSuccess={handleSuccess}
        apiMethod={async (data) => {
            // 根据是否存在编辑记录选择更新/添加接口
            if (editingRecord?.type === 'intDeworm') {
                await CatDbProxy.updateInternalDeworming(data);
            } else {
                await CatDbProxy.addInternalDeworming(data);
            }
        }}
        catId={cat?.id}
        editingRecord={editingRecord?.type === 'intDeworm' ? editingRecord.data : undefined} // 新增：传递编辑记录
    />

    <PregnancyModal
        visible={showPregnancyForm}
        onCancel={() => setShowPregnancyForm(false)}
        onSuccess={handleSuccess}
        catId={cat?.id}
        editingRecord={editingRecord?.type === 'pregnancy' ? editingRecord.data : undefined} // 新增
      />
    <IllnessRecordModal
      visible={showIllnessForm}
      onCancel={() => setShowIllnessForm(false)}
      onSuccess={handleSuccess}
      catId={cat?.id}
      editingRecord={editingRecord?.type === 'illness' ? editingRecord.data : undefined} // 新增
    />
      <Spin spinning={loading}>
        {(
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'weight',
                label: '体重记录',
                children: (
                  <Space direction="vertical" className="w-full">
                    <Button onClick={() => {setShowWeightForm(true); setEditingRecord({type:'' , data: undefined})}}>添加体重记录</Button>
                    <List
                      dataSource={weightRecords}
                      renderItem={(record, index) => (
                        <List.Item
                          actions={[
                            <Button type="link" onClick={() => handleEditWeight(record)}>编辑</Button>,
                            <Button type="link" danger onClick={() => handleDelete('weight', record.id)}>
                              删除
                            </Button>
                          ]}
                        >
                          {`第${weightRecords.length - index}次记录 - ${record.weight}kg (${new Date(record.weighDate).toLocaleDateString()})`}
                        </List.Item>
                      )}
                    />
                  </Space>
                )
              },
              {
                key: 'vaccine',
                label: '疫苗接种',
                children: (
                  <Space direction="vertical" className="w-full">
                    <Button onClick={() => {setShowVaccineForm(true); setEditingRecord({type:'' , data: undefined})}}>添加疫苗记录</Button>
                    <List
                      dataSource={vaccinationRecords}
                      renderItem={(v: VaccinationRecord) => (
                        <List.Item
                          actions={[
                            <Button type="link" onClick={() => handleEditVaccine(v)}>编辑</Button>,
                            <Button type="link" danger onClick={() => handleDelete('vaccine', v.id)}>删除</Button>
                          ]}
                        >
                          {`${v.vaccineBrand} - 接种日期：${v.injectionDate}`}
                        </List.Item>
                      )}
                    />
                  </Space>
                )
              },
              {
                key: 'external-deworm',
                label: '体外驱虫',
                children: (
                  <Space direction="vertical" className="w-full">
                    <Button onClick={() => {setShowExternalDewormForm(true); setEditingRecord({type:'' , data: undefined})}}>
                      添加体外驱虫记录
                    </Button>
                    <List
                      dataSource={externalDewormings}
                      renderItem={(v: ExternalDeworming, index) => (
                        <List.Item
                          actions={[
                            <Button type="link" onClick={() => handleEditExternalDeworm(v)}>编辑</Button>,
                            <Button type="link" danger onClick={() => handleDelete('extDeworm', v.id)}>删除</Button>
                          ]}
                        >
                          {`第${externalDewormings.length - index}次 - ${v.brand} (${new Date(v.dewormingDate).toLocaleDateString()})`}
                        </List.Item>
                      )}
                    />
                  </Space>
                )
              },
              {
                key: 'internal-deworm',
                label: '体内驱虫',
                children: (
                  <Space direction="vertical" className="w-full">
                    <Button onClick={() => {setShowInternalDewormForm(true); setEditingRecord({type:'' , data: undefined})}}>
                      添加体内驱虫记录
                    </Button>
                    <List
                      dataSource={internalDewormings}
                      renderItem={(v: InternalDeworming, index) => (
                        <List.Item
                          actions={[
                            <Button type="link" onClick={() => handleEditInternalDeworm(v)}>编辑</Button>,
                            <Button type="link" danger onClick={() => handleDelete('intDeworm', v.id)}>删除</Button>
                          ]}
                        >
                          {`第${internalDewormings.length - index}次 - ${v.brand} (${new Date(v.dewormingDate).toLocaleDateString()})`}
                        </List.Item>
                      )}
                    />
                  </Space>
                )
              },
              {
                key: 'pregnancy',
                label: '怀孕管理',
                children: (
                  <Space direction="vertical" className="w-full">
                    <Button onClick={() => {setShowPregnancyForm(true); setEditingRecord({type:'' , data: undefined})}}>
                      添加怀孕记录
                    </Button>
                    <List
                      dataSource={pregnancies}
                      renderItem={(p: Pregnant, index) => (
                        <List.Item
                          actions={[
                            <Button type="link" onClick={() => handleEditPregnancy(p)}>编辑</Button>,
                            <Button type="link" danger onClick={() => handleDelete('pregnancy', p.id)}>删除</Button>
                          ]}
                        >
                          {`第${pregnancies.length - index}次 - 交配日期：${new Date(p.matingDate).toLocaleDateString()} | 预产期：${new Date(p.expectedDeliveryDate).toLocaleDateString()}`}
                        </List.Item>
                      )}
                    />
                  </Space>
                )
              },
              {
                key: 'illness',
                label: '疾病记录',
                children: (
                  <Space direction="vertical" className="w-full">
                    <Button onClick={() => {setShowIllnessForm(true); setEditingRecord({type:'' , data: undefined})}}>添加疾病记录</Button>
                    <List
                      dataSource={illnessRecords}
                      renderItem={(illness, index) => (
                        <List.Item
                          actions={[
                            <Button type="link" onClick={() => handleEditIllness(illness)}>编辑</Button>,
                            <Button type="link" danger onClick={() => handleDelete('illness', illness.id)}>删除</Button>
                          ]}
                        >
                          {`第${illnessRecords.length - index}次记录 - ${illness.illnessName}（治疗：${illness.treatmentMethod}）`}
                        </List.Item>
                      )}
                    />
                  </Space>
                )
              }
            ]}
            tabBarExtraContent={
              <Button type="primary" onClick={onCancel}>关闭</Button>
            }
          />
        )}
      </Spin>
    </Modal>
  )
}

export default PetStatusModal


