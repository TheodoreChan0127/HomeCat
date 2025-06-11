/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "./DBManager";
import { Cat } from "../entity/Cat";
import { Illness } from "../entity/Illness";
import { VaccinationRecord } from "../entity/VaccinationRecord";
import { ExternalDeworming } from "../entity/ExternalDeworming";
import { InternalDeworming } from "../entity/InternalDeworming";
import { Pregnant } from "../entity/Pregnant";
import { WeightRecord } from "../entity/WeightRecord";
import { Purchase } from "../entity/Purchase";
import { GoodsSale } from "../entity/GoodsSale";
import { KittenSale } from "../entity/KittenSale";
import { TableName, dbTables } from "../Types/database";

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

  // 物品采购相关
  public static async addPurchase(purchase: Purchase): Promise<number> {
    console.log("CatDbProxy.addPurchase: Adding purchase", purchase);
    try {
      // 1. 添加采购记录
      const purchaseId = await db.purchases.add(purchase);
      console.log("CatDbProxy.addPurchase: Purchase added with ID", purchaseId);

      // 2. 处理分摊/累计逻辑
      if (purchase.isSingleCat && purchase.catId) {
        // 单猫支出，累计到该猫的 totalExpense
        const cat = await db.cats.get(purchase.catId);
        console.log(
          "CatDbProxy.addPurchase: Looking up cat for single expense",
          purchase.catId,
          cat
        );
        if (cat) {
          const newExpense = (cat.totalExpense || 0) + purchase.amount;
          await db.cats.update(purchase.catId, { totalExpense: newExpense });
          console.log(
            "CatDbProxy.addPurchase: Cat totalExpense updated for",
            cat.name,
            newExpense
          );
        } else {
          // 如果猫咪不存在，抛出错误，前端会捕获并显示失败
          console.error(
            "CatDbProxy.addPurchase: Cat not found for single expense ID",
            purchase.catId
          );
          // 抛出错误，以便前端知道操作未完全成功
          throw new Error(
            `猫咪ID ${purchase.catId} 不存在，无法记录单猫支出。`
          );
        }
      } else {
        // 猫舍支出，均摊到所有在册猫
        const allCats = await db.cats.toArray();
        const count = allCats.length;
        console.log(
          "CatDbProxy.addPurchase: Distributing shared expense to",
          count,
          "cats"
        );
        if (count > 0) {
          const avg = purchase.amount / count;
          await Promise.all(
            allCats.map((cat) =>
              db.cats.update(cat.id, {
                totalExpense: (cat.totalExpense || 0) + avg,
              })
            )
          );
          console.log(
            "CatDbProxy.addPurchase: Shared expense distributed, avg",
            avg
          );
        } else {
          console.warn(
            "CatDbProxy.addPurchase: No cats found for shared expense distribution."
          );
        }
      }
      return purchaseId;
    } catch (error) {
      console.error(
        "CatDbProxy.addPurchase: Error during purchase operation",
        error
      );
      throw error; // 重新抛出错误，让调用者处理
    }
  }

  public static async getPurchases(): Promise<Purchase[]> {
    return await db.purchases.orderBy("purchaseDate").reverse().toArray();
  }

  public static async deletePurchase(id: number): Promise<void> {
    // 1. 获取采购记录
    const purchase = await db.purchases.get(id);
    if (!purchase) return;
    // 2. 删除采购记录
    await db.purchases.delete(id);
    // 3. 撤销分摊/累计逻辑
    if (purchase.isSingleCat && purchase.catId) {
      // 单猫支出，减去该猫的 totalExpense
      const cat = await db.cats.get(purchase.catId);
      if (cat) {
        const newExpense = (cat.totalExpense || 0) - purchase.amount;
        await db.cats.update(purchase.catId, { totalExpense: newExpense });
      }
    } else {
      // 猫舍支出，均摊撤销
      const allCats = await db.cats.toArray();
      const count = allCats.length;
      if (count > 0) {
        const avg = purchase.amount / count;
        await Promise.all(
          allCats.map((cat) =>
            db.cats.update(cat.id, {
              totalExpense: (cat.totalExpense || 0) - avg,
            })
          )
        );
      }
    }
  }

  // 物品销售相关
  public static async addGoodsSale(sale: GoodsSale): Promise<number> {
    return await db.goodsSales.add(sale);
  }

  public static async getGoodsSales(): Promise<GoodsSale[]> {
    return await db.goodsSales.orderBy("saleDate").reverse().toArray();
  }

  public static async deleteGoodsSale(id: number): Promise<void> {
    await db.goodsSales.delete(id);
  }

  // 小猫销售相关
  public static async addKittenSale(sale: KittenSale): Promise<number> {
    // 1. 添加销售记录
    const saleId = await db.kittenSales.add(sale);
    // 2. 查找父母
    const kitten = await db.cats.get(sale.kittenId);
    if (kitten) {
      const { fatherId, motherId } = kitten;
      const half = sale.amount / 2;
      if (fatherId) {
        const father = await db.cats.get(fatherId);
        if (father) {
          await db.cats.update(fatherId, {
            totalIncome: (father.totalIncome || 0) + half,
          });
        }
      }
      if (motherId) {
        const mother = await db.cats.get(motherId);
        if (mother) {
          await db.cats.update(motherId, {
            totalIncome: (mother.totalIncome || 0) + half,
          });
        }
      }
    }
    return saleId;
  }

  public static async getKittenSales(): Promise<KittenSale[]> {
    return await db.kittenSales.orderBy("saleDate").reverse().toArray();
  }

  public static async deleteKittenSale(id: number): Promise<void> {
    // 1. 获取销售记录
    const sale = await db.kittenSales.get(id);
    if (!sale) return;
    // 2. 删除销售记录
    await db.kittenSales.delete(id);
    // 3. 回退父母收益
    const kitten = await db.cats.get(sale.kittenId);
    if (kitten) {
      const { fatherId, motherId } = kitten;
      const half = sale.amount / 2;
      if (fatherId) {
        const father = await db.cats.get(fatherId);
        if (father) {
          await db.cats.update(fatherId, {
            totalIncome: (father.totalIncome || 0) - half,
          });
        }
      }
      if (motherId) {
        const mother = await db.cats.get(motherId);
        if (mother) {
          await db.cats.update(motherId, {
            totalIncome: (mother.totalIncome || 0) - half,
          });
        }
      }
    }
  }

  // 获取表信息
  static async getTableInfo(): Promise<{ name: string; count: number }[]> {
    try {
      const tableInfo = await Promise.all(
        Object.entries(dbTables).map(async ([name, table]) => ({
          name,
          count: await table.count(),
        }))
      );
      return tableInfo;
    } catch (error) {
      console.error("获取表信息失败:", error);
      throw new Error(
        `获取表信息失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  // 清空指定表
  static async clearTable(tableName: TableName): Promise<void> {
    try {
      await db.transaction("rw", Object.values(dbTables), async () => {
        let cats;
        switch (tableName) {
          case "cats":
            // 清空猫咪表时，需要同时清空所有相关记录
            await dbTables.illnesses.clear();
            await dbTables.vaccinationRecords.clear();
            await dbTables.internalDewormings.clear();
            await dbTables.externalDewormings.clear();
            await dbTables.pregnancies.clear();
            await dbTables.weightRecords.clear();
            await dbTables.purchases.clear();
            await dbTables.kittenSales.clear();
            await dbTables.cats.clear();
            break;
          case "purchases":
            // 清空采购表时，需要重置所有猫咪的支出
            cats = await dbTables.cats.toArray();
            await Promise.all(
              cats.map((cat) =>
                dbTables.cats.update(cat.id, { totalExpense: 0 })
              )
            );
            await dbTables.purchases.clear();
            break;
          case "goodsSales":
            // 清空物品销售表
            await dbTables.goodsSales.clear();
            break;
          case "kittenSales":
            // 清空小猫销售表时，需要重置所有猫咪的收入
            cats = await dbTables.cats.toArray();
            await Promise.all(
              cats.map((cat) =>
                dbTables.cats.update(cat.id, { totalIncome: 0 })
              )
            );
            await dbTables.kittenSales.clear();
            break;
        }
      });
    } catch (error) {
      console.error("清空表失败:", error);
      throw new Error(
        `清空表失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  // 清空所有表
  static async clearAllTables(): Promise<void> {
    try {
      await db.transaction("rw", Object.values(dbTables), async () => {
        // 先清空所有关联表
        await dbTables.illnesses.clear();
        await dbTables.vaccinationRecords.clear();
        await dbTables.internalDewormings.clear();
        await dbTables.externalDewormings.clear();
        await dbTables.pregnancies.clear();
        await dbTables.weightRecords.clear();
        await dbTables.purchases.clear();
        await dbTables.goodsSales.clear();
        await dbTables.kittenSales.clear();
        // 最后清空猫咪表
        await dbTables.cats.clear();
      });
    } catch (error) {
      console.error("清空所有表失败:", error);
      throw new Error(
        `清空所有表失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  // 导出表数据
  static async dumpTable(tableName: TableName): Promise<any[]> {
    try {
      return await dbTables[tableName].toArray();
    } catch (error) {
      console.error("导出表数据失败:", error);
      throw new Error(
        `导出表数据失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }
}
