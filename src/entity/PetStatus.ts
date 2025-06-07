import { Pregnant } from "./Pregnant";
import { VaccinationRecord } from "./VaccinationRecord";
import { ExternalDeworming } from "./ExternalDeworming";
import { Illness } from "./Illness";
import { InternalDeworming } from "./InternalDeworming";
import { WeightRecord } from "./WeightRecord";

export class PetStatus {
  id: number;
  weightRecords: WeightRecord[] = []; // 替换原weight数组
  diet: string;
  pregnancies: Pregnant[] = [];
  vaccinationRecords: VaccinationRecord[] = [];
  externalDewormings: ExternalDeworming[] = [];
  illnesses: Illness[] = [];
  internalDewormings: InternalDeworming[] = [];
  catId: number; // 通过id引用Cat，避免循环引用

  constructor() {
    this.id = 0; // 需根据实际情况初始化，或通过数据库生成
    this.catId = 0; // 关联的Cat id
  }
}
