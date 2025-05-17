export class InternalDeworming {
  id: number;
  petStatusId: number;

  brand = "";
  dewormingDate: Date = new Date();
  reminderDate: Date = new Date();

  constructor() {
    this.id = 0; // 需根据实际情况初始化，或通过数据库生成
    this.petStatusId = 0; // 关联的PetStatus id
  }
}
