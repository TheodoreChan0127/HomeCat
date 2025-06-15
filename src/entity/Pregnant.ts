export class Pregnant {
  id: number;
  catId: number;
  maleCatId: number | null = null; // 交配公猫ID
  matingDate: string;
  expectedDeliveryDate: string;
  reminder7Days: string;
  reminder3Days: string;
  reminder1Day: string;
  isDelivered = false;
  deliveryCount: number | null = null;
  notes = "";

  constructor() {
    this.id = 0; // 需根据实际情况初始化，或通过数据库生成
  }
}
