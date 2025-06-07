import { db } from "./DBManager";
import { Cat } from "../entity/Cat";
import { Illness } from "../entity/Illness";
import { VaccinationRecord } from "../entity/VaccinationRecord";
import { ExternalDeworming } from "../entity/ExternalDeworming";
import { InternalDeworming } from "../entity/InternalDeworming";
import { Pregnant } from "../entity/Pregnant";
import { PetStatus } from "../entity/PetStatus";
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
    return {
      cats,
      illnesses,
      vaccinationRecords,
      internalDewormings,
      externalDewormings,
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
          db.petStatuses,
          db.illnesses,
          db.vaccinationRecords,
          db.internalDewormings,
          db.externalDewormings,
        ],
        async () => {
          // 先删除关联记录
          const petStatus = await db.petStatuses
            .where("catId")
            .equals(id)
            .first();
          if (petStatus) {
            await db.illnesses
              .where("petStatusId")
              .equals(petStatus.id)
              .delete();
            await db.vaccinationRecords
              .where("petStatusId")
              .equals(petStatus.id)
              .delete();
            await db.internalDewormings
              .where("petStatusId")
              .equals(petStatus.id)
              .delete();
            await db.externalDewormings
              .where("petStatusId")
              .equals(petStatus.id)
              .delete();
            await db.petStatuses.where("catId").equals(id).delete();
          }
          // 最后删除主记录
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
          db.petStatuses,
          db.illnesses,
          db.vaccinationRecords,
          db.internalDewormings,
          db.externalDewormings,
        ],
        async () => {
          await db.illnesses.clear();
          await db.vaccinationRecords.clear();
          await db.internalDewormings.clear();
          await db.externalDewormings.clear();
          await db.petStatuses.clear();
          await db.cats.clear();
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

  static async getPregnanciesByPetStatusId(
    petStatusId: number
  ): Promise<Pregnant[]> {
    try {
      return await db.pregnancies
        .where("petStatusId")
        .equals(petStatusId)
        .toArray();
    } catch (error) {
      throw new Error(`获取怀孕记录失败: ${error.message}`);
    }
  }

  static async getVaccinationsByPetStatusId(
    petStatusId: number
  ): Promise<VaccinationRecord[]> {
    try {
      return await db.vaccinationRecords
        .where("petStatusId")
        .equals(petStatusId)
        .toArray();
    } catch (error) {
      throw new Error(`获取疫苗接种记录失败: ${error.message}`);
    }
  }

  static async getIllnessesByPetStatusId(
    petStatusId: number
  ): Promise<Illness[]> {
    try {
      return await db.illnesses
        .where("petStatusId")
        .equals(petStatusId)
        .toArray();
    } catch (error) {
      throw new Error(`获取疾病记录失败: ${error.message}`);
    }
  }

  static async getExternalDewormingsByPetStatusId(
    petStatusId: number
  ): Promise<ExternalDeworming[]> {
    try {
      return await db.externalDewormings
        .where("petStatusId")
        .equals(petStatusId)
        .toArray();
    } catch (error) {
      throw new Error(`获取体外驱虫记录失败: ${error.message}`);
    }
  }

  static async getInternalDewormingsByPetStatusId(
    petStatusId: number
  ): Promise<InternalDeworming[]> {
    try {
      return await db.internalDewormings
        .where("petStatusId")
        .equals(petStatusId)
        .toArray();
    } catch (error) {
      throw new Error(`获取体内驱虫记录失败: ${error.message}`);
    }
  }

  // 完整宠物状态操作
  static async getFullPetStatus(catId: number): Promise<PetStatus> {
    try {
      const petStatus = await db.petStatuses
        .where("catId")
        .equals(catId)
        .first();

      if (!petStatus) return new PetStatus();

      // 并行获取所有关联数据
      const [
        pregnancies,
        vaccinations,
        illnesses,
        externalDewormings,
        internalDewormings,
      ] = await Promise.all([
        this.getPregnanciesByPetStatusId(petStatus.id),
        this.getVaccinationsByPetStatusId(petStatus.id),
        this.getIllnessesByPetStatusId(petStatus.id),
        this.getExternalDewormingsByPetStatusId(petStatus.id),
        this.getInternalDewormingsByPetStatusId(petStatus.id),
      ]);

      return {
        ...petStatus,
        pregnancies,
        vaccinationRecords: vaccinations,
        illnesses,
        externalDewormings,
        internalDewormings,
      };
    } catch (error) {
      throw new Error(`获取完整宠物状态失败: ${error.message}`);
    }
  }

  // 保存完整宠物状态（事务操作）
  // 在事务操作中添加weightRecords表
  static async saveFullPetStatus(petStatus: PetStatus): Promise<void> {
    await db.transaction(
      "rw",
      [
        db.petStatuses,
        db.weightRecords, // 新增weightRecords表
        db.pregnancies,
        db.vaccinationRecords,
        db.illnesses,
        db.externalDewormings,
        db.internalDewormings,
      ],
      async () => {
        const statusId = await db.petStatuses.put(petStatus);
        // 并行保存子记录
        await Promise.all([
          // 添加体重记录处理
          ...petStatus.weightRecords.map((record) =>
            record.id
              ? this.updateWeightRecord(record)
              : this.addWeightRecord({ ...record, petStatusId: statusId })
          ),
          // vepregnancy记录
          ...petStatus.pregnancies.map((record) =>
            record.id
              ? this.updatePregnancy(record)
              : this.addPregnancy({ ...record, petStatusId: statusId })
          ),
          // 疫苗接种记录
          ...petStatus.vaccinationRecords.map((record) =>
            record.id
              ? this.updateVaccinationRecord(record)
              : this.addVaccinationRecord({ ...record, petStatusId: statusId })
          ),
          // 疾病记录
          ...petStatus.illnesses.map((record) =>
            record.id
              ? this.updateIllness(record)
              : this.addIllness({ ...record, petStatusId: statusId })
          ),
          // 体外驱虫记录
          ...petStatus.externalDewormings.map((record) =>
            record.id
              ? this.updateExternalDeworming(record)
              : this.addExternalDeworming({ ...record, petStatusId: statusId })
          ),
          // 体内驱虫记录
          ...petStatus.internalDewormings.map((record) =>
            record.id
              ? this.updateInternalDeworming(record)
              : this.addInternalDeworming({ ...record, petStatusId: statusId })
          ),
        ]);
      }
    );
  }

  // 添加CRUD方法
  static async addWeightRecord(record: WeightRecord): Promise<WeightRecord> {
    const id = await db.weightRecords.add(record);
    return { ...record, id };
  }

  static async getWeightRecordsByPetStatusId(
    petStatusId: number
  ): Promise<WeightRecord[]> {
    return db.weightRecords.where("petStatusId").equals(petStatusId).toArray();
  }

  static async updateWeightRecord(record: WeightRecord): Promise<WeightRecord> {
    await db.weightRecords.update(record.id, record);
    return record;
  }

  // 可扩展其他API：deleteCat示例已实现，可继续扩展getCatById等方法
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
}
