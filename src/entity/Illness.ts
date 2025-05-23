export class Illness {
  id: number;

  petStatusId: number;

  illnessName = ""; // 患病名称

  treatmentMethod = ""; // 治疗方法

  constructor() {
    this.id = 0; // 需根据实际情况初始化，或通过数据库生成
    this.petStatusId = 0; // 关联的PetStatus id
  }
}
