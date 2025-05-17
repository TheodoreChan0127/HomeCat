export class Pregnant {
  id: number;
  petStatusId: number;
  matingDate: Date = new Date();
  expectedDeliveryDate: Date = new Date();
  reminder7Days: Date | null = null;
  reminder3Days: Date | null = null;
  reminder1Day: Date | null = null;
  isDelivered = false;
  deliveryCount: number | null = null;
  notes = "";

  constructor() {
    this.id = 0; // 需根据实际情况初始化，或通过数据库生成
    this.petStatusId = 0; // 关联的PetStatus id
  }
}
