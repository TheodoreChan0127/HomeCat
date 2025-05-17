import { Pregnant } from "./Pregnant";
import { VaccinationRecord } from "./VaccinationRecord";
import { ExternalDeworming } from "./ExternalDeworming";
import { Illness } from "./Illness";
import { InternalDeworming } from "./InternalDeworming";

export class PetStatus {
  id: number;
  weight: number[] = [];
  lastWeightDate: Date = new Date();
  diet = "";
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
