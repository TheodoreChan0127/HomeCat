/* eslint-disable @typescript-eslint/no-unused-vars */
import { Cat } from '../entity/Cat'
import { PetStatus } from '../entity/PetStatus'
import { CatDbProxy } from '../db/CatDbProxy'
import React, { JSX, useEffect, useState } from 'react'
import { Button, Tabs, Space,List, Spin, Modal } from 'antd'
import { WeightRecordModal} from '../components/records/WeightRecordModal';
import { VaccinationModal } from '../components/records/VaccinationModal';
import { DewormModal } from '../components/records/DewormModal';
import { PregnancyModal } from './records/PregnancyModal';

interface PetStatusModalProps {
  visible: boolean
  onCancel: () => void
  cat: Cat | null
}

function PetStatusModal({ visible, onCancel, cat }: PetStatusModalProps): JSX.Element {
  const [status, setStatus] = useState<PetStatus | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && cat) {
      setLoading(true)
      CatDbProxy.getFullPetStatus(cat.id)
        .then(setStatus)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [visible, cat])

  // 新增状态管理
  const [activeTab, setActiveTab] = useState('weight');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showVaccineForm, setShowVaccineForm] = useState(false);
  const [showExternalDewormForm, setShowExternalDewormForm] = useState(false);
  const [showInternalDewormForm, setShowInternalDewormForm] = useState(false);
  const [showPregnancyForm, setShowPregnancyForm] = useState(false);

  // 在组件内添加状态管理
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    // 重新获取最新状态
    if (cat) {
      CatDbProxy.getFullPetStatus(cat.id).then(setStatus);
    }
  };

  
  
  return (
    <Modal
      title="健康状态管理"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose
    >
    <WeightRecordModal
        visible={showWeightForm}
        onCancel={() => setShowWeightForm(false)}
        onSuccess={handleSuccess}
    />
    
    <VaccinationModal
        visible={showVaccineForm}
        onCancel={() => setShowVaccineForm(false)}
        onSuccess={handleSuccess}
    />
    
    <DewormModal
        title="体外驱虫记录"
        visible={showExternalDewormForm}
        onCancel={() => setShowExternalDewormForm(false)}
        onSuccess={handleSuccess}
        apiMethod={async (data) => {
            await CatDbProxy.addExternalDeworming(data);
          }}
    />
    
    <DewormModal
        title="体内驱虫记录"
        visible={showInternalDewormForm}
        onCancel={() => setShowInternalDewormForm(false)}
        onSuccess={handleSuccess}
        apiMethod={async (data) => {
            await CatDbProxy.addInternalDeworming(data);
          }}
    />

    <PregnancyModal
        visible={showPregnancyForm}
        onCancel={() => setShowPregnancyForm(false)}
        onSuccess={handleSuccess}
      />
      <Spin spinning={loading}>
        {status && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarExtraContent={
              <Button type="primary" onClick={onCancel}>
                关闭
              </Button>
            }
          >
            {/* 体重记录标签页 */}
            <Tabs.TabPane tab="体重记录" key="weight">
              <Space direction="vertical" className="w-full">
                <Button onClick={() => setShowWeightForm(true)}>添加体重记录</Button>
                <List
                  dataSource={status.weightRecords}
                  renderItem={record => (
                    <List.Item>
                      {`${record.weight}kg - ${record.weighDate || '未记录日期'}`}
                    </List.Item>
                  )}
                />
              </Space>
            </Tabs.TabPane>

            {/* 疫苗接种标签页 */}
            <Tabs.TabPane tab="疫苗接种" key="vaccine">
              <Space direction="vertical" className="w-full">
                <Button onClick={() => setShowVaccineForm(true)}>添加疫苗记录</Button>
                <List
                  dataSource={status.vaccinationRecords}
                  renderItem={v => (
                    <List.Item>
                      {`${v.vaccineBrand} - ${v.injectionDate}`}
                    </List.Item>
                  )}
                />
              </Space>
            </Tabs.TabPane>

            {/* 驱虫记录分标签 */}
            <Tabs.TabPane tab="驱虫管理" key="deworm">
              <Tabs type="card">
                <Tabs.TabPane tab="体外驱虫" key="external">
                  <Space direction="vertical" className="w-full">
                    <Button onClick={() => setShowExternalDewormForm(true)}>
                      添加体外驱虫
                    </Button>
                    <List
                      dataSource={status.externalDewormings}
                      renderItem={d => (
                        <List.Item>
                          {`${d.brand} - ${d.dewormingDate}`}
                        </List.Item>
                      )}
                    />
                  </Space>
                </Tabs.TabPane>
                <Tabs.TabPane tab="体内驱虫" key="internal">
                  <Space direction="vertical" className="w-full">
                    <Button onClick={() => setShowInternalDewormForm(true)}>
                      添加体内驱虫
                    </Button>
                    <List
                      dataSource={status.internalDewormings}
                      renderItem={d => (
                        <List.Item>
                          {`${d.brand} - ${d.dewormingDate}`}
                        </List.Item>
                      )}
                    />
                  </Space>
                </Tabs.TabPane>
              </Tabs>
            </Tabs.TabPane>

            {/* 怀孕记录标签页 */}
            <Tabs.TabPane tab="怀孕管理" key="pregnancy">
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <Button 
                    type="primary" 
                    onClick={() => setShowPregnancyForm(true)}
                  >
                    新建怀孕记录
                  </Button>
                </div>
                <List
                  bordered
                  dataSource={status.pregnancies}
                  renderItem={p => (
                    <List.Item className="hover:bg-gray-50 transition-colors">
                      <div className="w-full flex justify-between">
                        <div>
                          <span className="font-medium">交配日期：</span>
                          {p.matingDate}
                        </div>
                        <div>
                          <span className="font-medium">预产期：</span>
                          {p.expectedDeliveryDate}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Space>
            </Tabs.TabPane>
          </Tabs>
        )}
      </Spin>
    </Modal>
  )
}

export default PetStatusModal