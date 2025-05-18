import React,{ JSX, useState, useEffect } from "react"
import { getBreeds, saveBreeds } from '../config/breeds'
import { CatDbProxy } from '../db/CatDbProxy'
import { Modal, Form, Input, Select, Switch, Space, DatePicker } from 'antd'

interface AddCatModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

function AddCatModal({ visible, onCancel, onSuccess }: AddCatModalProps): JSX.Element {
  const [form] = Form.useForm()
  const [breeds, setBreeds] = useState<string[]>([]);

  useEffect(() => {
    const loadBreeds = async () => {
      const breedList = getBreeds();
      setBreeds(breedList);
    };
    loadBreeds();
  }, []);
  const [isSickVisible, setIsSickVisible] = useState(false)
  const [isVaccinatedVisible, setIsVaccinatedVisible] = useState(false)
  const [dewormingTypes, setDewormingTypes] = useState<('internal' | 'external')[]>([]);
  const [isDewormedChecked, setIsDewormedChecked] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields()
      // 插入主表并获取ID
      const catId = await CatDbProxy.addCat(values)
      // 插入关联子表
      if (values.isSick) {
        await CatDbProxy.addIllness({...values.illness, petStatusId: catId})
      }
      if (values.isVaccinated) {
        await CatDbProxy.addVaccinationRecord({...values.vaccination, petStatusId: catId})
      }
      if (values.isDewormed) {
        const dewormingData = {...values.deworming, petStatusId: catId};
        if (values.dewormingType === 'internal') {
          await CatDbProxy.addInternalDeworming(dewormingData);
        } else {
          await CatDbProxy.addExternalDeworming(dewormingData);
        }
      }
      onSuccess()
      form.resetFields()
      onCancel()
    } catch (error) {
      console.error('添加猫咪失败:', error)
    }
  }

  return (
    <Modal
      title="添加新猫咪"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="确认添加"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" initialValues={{ age: 1 }}>
        <Form.Item
          name="name"
          label="猫咪名称"
          rules={[{ required: true, message: '请输入猫咪名称' }]}
        >
          <Input placeholder="请输入猫咪名称" />
        </Form.Item>

        <Form.Item
          name="breed"
          label="猫咪品种"
          rules={[{ required: true, message: '请选择猫咪品种' }]}
        >
          <Select
            placeholder="请选择或输入猫咪品种"
            style={{ width: 200 }}
            options={breeds.map(breed => ({ value: breed, label: breed }))}
            allowClear
            showSearch
            onSelect={value => form.setFieldsValue({ breed: value })}
            onSearch={async (input) => {
              if (!breeds.includes(input)) {
                const newBreeds = [...breeds, input];
                setBreeds(newBreeds);
                saveBreeds(newBreeds);
              }
            }}
          />
          <Input
            placeholder="输入新品种"
            style={{ width: 200, marginLeft: 8 }}
            onChange={(e) => {
              const newBreed = e.target.value;
              if (newBreed && !breeds.includes(newBreed)) {
                const newBreeds = [...breeds, newBreed];
                setBreeds(newBreeds);
                saveBreeds(newBreeds);
                form.setFieldsValue({ breed: newBreed });
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="age"
          label="年龄（岁）"
          rules={[{ required: true, type: 'number', min: 0, message: '请输入有效年龄' }]}
        >
          <Input placeholder="请输入年龄" min={0} />
        </Form.Item>

        <Form.Item
          name="fatherId"
          label="父ID"
          rules={[{ type: 'number', min: 0, message: '请输入有效父ID' }]}
        >
          <Input placeholder="请输入父ID（可选）" min={0} />
        </Form.Item>

        <Form.Item
          name="motherId"
          label="母ID"
          rules={[{ type: 'number', min: 0, message: '请输入有效母ID' }]}
        >
          <Input placeholder="请输入母ID（可选）" min={0} />
        </Form.Item>

        <Form.Item
          name="color"
          label="毛色"
          rules={[{ message: '请输入毛色' }]}
        >
          <Input placeholder="请输入毛色（可选）" />
        </Form.Item>

        <Form.Item
          name="birthDate"
          label="出生日期"
          rules={[{ type: 'date', message: '请选择正确的出生日期' }]}
        >
          <DatePicker format="YYYY-MM-DD" placeholder="请选择出生日期（可选）" />
        </Form.Item>

        <Form.Item
          name="arrivalDate"
          label="到家日期"
          rules={[{ type: 'date', message: '请选择正确的到家日期' }]}
        >
          <DatePicker format="YYYY-MM-DD" placeholder="请选择到家日期（可选）" />
        </Form.Item>

        <Form.Item
          name="totalIncome"
          label="总收益（元）"
        >
          <Input placeholder="请输入总收益（可选）" min={0} />
        </Form.Item>

        <Form.Item
          name="totalExpense"
          label="总支出（元）"
        >
          <Input placeholder="请输入总支出（可选）" min={0} />
        </Form.Item>

        <Form.Item
          name="weight"
          label="体重（kg）"
        >
          <Input placeholder="请输入体重（可选）" min={0} />
        </Form.Item>

        <Space direction="vertical" size="middle">
        {isSickVisible && (
          <div>
            <Form.Item name="illnessName" label="患病名称" rules={[{ required: true }]}>
              <Input placeholder="请输入患病名称" />
            </Form.Item>
            <Form.Item name="treatmentMethod" label="治疗方法" rules={[{ required: true }]}>
              <Input placeholder="请输入治疗方法" />
            </Form.Item>
          </div>
        )}
        {isVaccinatedVisible && (
          <div>
            <Form.Item name="vaccineBrand" label="疫苗品牌" rules={[{ required: true }]}>
              <Input placeholder="请输入疫苗品牌" />
            </Form.Item>
            <Form.Item name="injectionDate" label="接种日期" rules={[{ required: true }]}>
              <DatePicker format="YYYY-MM-DD" placeholder="请选择接种日期" />
            </Form.Item>
          </div>
        )}
        {isDewormedChecked && dewormingTypes.includes('internal') && (
          <div>
            <Form.Item name="internalDewormingBrand" label="体内驱虫药品牌" rules={[{ required: true }]}>
              <Input placeholder="请输入体内驱虫药品牌" />
            </Form.Item>
            <Form.Item name="internalDewormingDate" label="体内驱虫日期" rules={[{ required: true }]}>
              <DatePicker format="YYYY-MM-DD" placeholder="请选择体内驱虫日期" />
            </Form.Item>
          </div>
        )}
        {isDewormedChecked && dewormingTypes.includes('external') && (
          <div>
            <Form.Item name="externalDewormingBrand" label="体外驱虫药品牌" rules={[{ required: true }]}>
              <Input placeholder="请输入体外驱虫药品牌" />
            </Form.Item>
            <Form.Item name="externalDewormingDate" label="体外驱虫日期" rules={[{ required: true }]}>
              <DatePicker format="YYYY-MM-DD" placeholder="请选择体外驱虫日期" />
            </Form.Item>
          </div>
        )}
        {isDewormedChecked && (
        <Form.Item name="dewormingType" label="驱虫类型" rules={[{ required: true, message: '请选择驱虫类型' }]}>
          <Select placeholder="请选择驱虫类型" mode="multiple" onChange={value => setDewormingTypes(value as ('internal' | 'external')[])}>
            <Select.Option value="internal">体内驱虫</Select.Option>
            <Select.Option value="external">体外驱虫</Select.Option>
          </Select>
        </Form.Item>
      )}
          <Form.Item name="isPregnant" valuePropName="checked">
            <Switch checkedChildren="已怀孕" unCheckedChildren="未怀孕" />
          </Form.Item>
          <Form.Item name="isSick" valuePropName="checked">
            <Switch checkedChildren="生病中" unCheckedChildren="健康" onChange={checked => setIsSickVisible(checked)} />
          </Form.Item>
          <Form.Item name="isVaccinated" valuePropName="checked">
            <Switch checkedChildren="已接种疫苗" unCheckedChildren="未接种" onChange={checked => setIsVaccinatedVisible(checked)} />
          </Form.Item>
          <Form.Item name="isDewormed" valuePropName="checked">
            <Switch checkedChildren="已驱虫" unCheckedChildren="未驱虫" onChange={checked => setIsDewormedChecked(checked)} />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  )
}

export default AddCatModal