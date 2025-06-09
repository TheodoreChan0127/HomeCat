export class InternalDeworming {
  id: number;
  catId: number;
  brand = "";
  dewormingDate: string;
  reminderDate: string;

  constructor() {
    this.id = 0; // 需根据实际情况初始化，或通过数据库生成
  }
}
