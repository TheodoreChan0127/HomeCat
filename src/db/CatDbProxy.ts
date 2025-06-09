import { db } from "./DBManager";
import { Cat } from "../entity/Cat";
import { Illness } from "../entity/Illness";
import { VaccinationRecord } from "../entity/VaccinationRecord";
import { ExternalDeworming } from "../entity/ExternalDeworming";
import { InternalDeworming } from "../entity/InternalDeworming";
import { Pregnant } from "../entity/Pregnant";
import { WeightRecord } from "../entity/WeightRecord";

interface GetCatsParams {
  currentPage: number;
  itemsPerPage: number;
  filters: {
    name?: string;
    breed?: string;
    isPregnant?: boolean;
    isSick?: boolean;
    isVaccinated?: boolean;
    isDewormed?: boolean;
  };
}

interface GetCatsResult {
  data: Cat[];
  total: number;
  totalPages: number;
}

export class CatDbProxy {
  public static async getCats(params: GetCatsParams): Promise<GetCatsResult> {
    const {
      currentPage,
      itemsPerPage,
      filters: { name, breed, isPregnant, isSick, isVaccinated, isDewormed },
    } = params;

    let query = db.cats.where("id").above(0);

    if (name) query = query.and((cat) => cat.name.includes(name));
    if (breed) query = query.and((cat) => cat.breed === breed);
    if (isPregnant !== undefined)
      query = query.and((cat) => cat.isPregnant === isPregnant);
    if (isSick !== undefined) query = query.and((cat) => cat.isSick === isSick);
    if (isVaccinated !== undefined)
      query = query.and((cat) => cat.isVaccinated === isVaccinated);
    if (isDewormed !== undefined)
      query = query.and((cat) => cat.isDewormed === isDewormed);

    const total = await query.count();
    const totalPages = total === 0 ? 1 : Math.ceil(total / itemsPerPage);
    const data = await query
      .offset((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .toArray();

    return { data, total, totalPages };
  }

  public static async addCat(cat: Cat): Promise<Cat> {
    const id = await db.cats.add(cat);
    return { ...cat, id };
  }

  public static async addIllness(illness: Illness): Promise<Illness> {
    const id = await db.illnesses.add(illness);
    return { ...illness, id };
  }

  public static async addVaccinationRecord(
    record: VaccinationRecord
  ): Promise<VaccinationRecord> {
    const id = await db.vaccinationRecords.add(record);
    return { ...record, id };
  }

  public static async addInternalDeworming(
    record: InternalDeworming
  ): Promise<InternalDeworming> {
    const id = await db.internalDewormings.add(record);
    return { ...record, id };
  }

  public static async addExternalDeworming(
    record: ExternalDeworming
  ): Promise<ExternalDeworming> {
    const id = await db.externalDewormings.add(record);
    return { ...record, id };
  }
  public static async getTableCounts(): Promise<Record<string, number>> {
    const cats = await db.cats.count();
    const illnesses = await db.illnesses.count();
    const vaccinationRecords = await db.vaccinationRecords.count();
    const internalDewormings = await db.internalDewormings.count();
    const externalDewormings = await db.externalDewormings.count();
    const pregnancies = await db.pregnancies.count();
    const weightRecords = await db.weightRecords.count();

    return {
      cats,
      illnesses,
      vaccinationRecords,
      internalDewormings,
      externalDewormings,
      pregnancies,
      weightRecords,
    };
  }
  public static async updateCat(cat: Cat): Promise<Cat> {
    const { id, ...changes } = cat;
    await db.cats.update(id, {
      ...changes,
    });
    return cat;
  }
  public static async deleteCat(id: number): Promise<void> {
    try {
      await db.transaction(
        "rw",
        [
          db.cats,
          db.illnesses,
          db.vaccinationRecords,
          db.internalDewormings,
          db.externalDewormings,
          db.pregnancies, // 补充怀孕记录关联表
          db.weightRecords, // 补充体重记录关联表
        ],
        async () => {
          // 修正外键查询条件为catId
          await db.illnesses.where("catId").equals(id).delete();
          await db.vaccinationRecords.where("catId").equals(id).delete();
          await db.internalDewormings.where("catId").equals(id).delete();
          await db.externalDewormings.where("catId").equals(id).delete();
          await db.pregnancies.where("catId").equals(id).delete(); // 新增怀孕记录删除
          await db.weightRecords.where("catId").equals(id).delete(); // 新增体重记录删除
          await db.cats.delete(id);
        }
      );
    } catch (error) {
      throw new Error(
        `删除失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  public static async deleteAll(): Promise<void> {
    try {
      await db.transaction(
        "rw",
        [
          db.cats,
          db.illnesses,
          db.vaccinationRecords,
          db.internalDewormings,
          db.externalDewormings,
          db.pregnancies,
          db.weightRecords,
        ],
        async () => {
          await db.illnesses.clear();
          await db.vaccinationRecords.clear();
          await db.internalDewormings.clear();
          await db.externalDewormings.clear();
          await db.cats.clear();
          await db.pregnancies.clear();
          await db.weightRecords.clear();
        }
      );
    } catch (error) {
      throw new Error(
        `清空数据失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  // 怀孕记录操作
  static async addPregnancy(pregnancy: Pregnant): Promise<number> {
    try {
      return await db.pregnancies.add(pregnancy);
    } catch (error) {
      throw new Error(`添加怀孕记录失败: ${error.message}`);
    }
  }

  static async updatePregnancy(pregnancy: Pregnant): Promise<number> {
    try {
      return await db.pregnancies.update(pregnancy.id, pregnancy);
    } catch (error) {
      throw new Error(`更新怀孕记录失败: ${error.message}`);
    }
  }

  static async deletePregnancy(id: number): Promise<void> {
    try {
      await db.pregnancies.delete(id);
    } catch (error) {
      throw new Error(`删除怀孕记录失败: ${error.message}`);
    }
  }

  static async getPregnanciesByCatId(catId: number): Promise<Pregnant[]> {
    try {
      return await db.pregnancies.where("catId").equals(catId).toArray();
    } catch (error) {
      throw new Error(`获取怀孕记录失败: ${error.message}`);
    }
  }

  static async getVaccinationsByCatId(
    catId: number
  ): Promise<VaccinationRecord[]> {
    try {
      return await db.vaccinationRecords.where("catId").equals(catId).toArray();
    } catch (error) {
      throw new Error(`获取疫苗接种记录失败: ${error.message}`);
    }
  }

  static async getIllnessesByCatId(catId: number): Promise<Illness[]> {
    try {
      return await db.illnesses.where("catId").equals(catId).toArray();
    } catch (error) {
      throw new Error(`获取疾病记录失败: ${error.message}`);
    }
  }

  static async getExternalDewormingsByCatId(
    catId: number
  ): Promise<ExternalDeworming[]> {
    try {
      return await db.externalDewormings.where("catId").equals(catId).toArray();
    } catch (error) {
      throw new Error(`获取体外驱虫记录失败: ${error.message}`);
    }
  }

  static async getInternalDewormingsByCatId(
    catId: number
  ): Promise<InternalDeworming[]> {
    try {
      return await db.internalDewormings.where("catId").equals(catId).toArray();
    } catch (error) {
      throw new Error(`获取体内驱虫记录失败: ${error.message}`);
    }
  }

  static async addWeightRecord(record: WeightRecord): Promise<number> {
    return await db.weightRecords.add(record);
  }

  static async getWeightRecordsByCatId(catId: number): Promise<WeightRecord[]> {
    return db.weightRecords.where("catId").equals(catId).toArray();
  }

  static async updateWeightRecord(record: WeightRecord): Promise<WeightRecord> {
    await db.weightRecords.update(record.id, record);
    return record;
  }

  // 可扩展其他API：deleteCat示例已实现，可继续扩展getCatByCatId等方法
  public static async updateIllness(illness: Illness): Promise<Illness> {
    try {
      await db.illnesses.update(illness.id, illness);
      return illness;
    } catch (error) {
      throw new Error(
        `更新疾病记录失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  public static async updateVaccinationRecord(
    record: VaccinationRecord
  ): Promise<VaccinationRecord> {
    try {
      await db.vaccinationRecords.update(record.id, record);
      return record;
    } catch (error) {
      throw new Error(
        `更新疫苗接种记录失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  public static async updateInternalDeworming(
    record: InternalDeworming
  ): Promise<InternalDeworming> {
    try {
      await db.internalDewormings.update(record.id, record);
      return record;
    } catch (error) {
      throw new Error(
        `更新体内驱虫记录失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  public static async updateExternalDeworming(
    record: ExternalDeworming
  ): Promise<ExternalDeworming> {
    try {
      await db.externalDewormings.update(record.id, record);
      return record;
    } catch (error) {
      throw new Error(
        `更新体外驱虫记录失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  public static async deleteIllness(id: number): Promise<void> {
    try {
      await db.illnesses.delete(id);
    } catch (error) {
      throw new Error(
        `删除疾病记录失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  public static async deleteVaccinationRecord(id: number): Promise<void> {
    try {
      await db.vaccinationRecords.delete(id);
    } catch (error) {
      throw new Error(
        `删除疫苗接种记录失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  public static async deleteInternalDeworming(id: number): Promise<void> {
    try {
      await db.internalDewormings.delete(id);
    } catch (error) {
      throw new Error(
        `删除体内驱虫记录失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  public static async deleteExternalDeworming(id: number): Promise<void> {
    try {
      await db.externalDewormings.delete(id);
    } catch (error) {
      throw new Error(
        `删除体外驱虫记录失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  public static async deleteWeightRecord(id: number): Promise<void> {
    try {
      await db.weightRecords.delete(id);
    } catch (error) {
      throw new Error(
        `删除体重记录失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }
}
