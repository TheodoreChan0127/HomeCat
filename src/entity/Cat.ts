/* eslint-disable @typescript-eslint/no-explicit-any */
import { CatDbProxy } from "../db/CatDbProxy";
import { PetStatus } from "./PetStatus";

export interface CatFilters {
  isPregnant?: boolean;
  isSick?: boolean;
  isVaccinated?: boolean;
  isDewormed?: boolean;
}

export class Cat {
  id = 0; // 宠物编号

  name = ""; // 名字

  age = -1; // 年龄

  fatherId = -1; // 父宠物编号（外键）

  motherId = -1; // 母宠物编号（外键）

  animalType = "猫"; // 动物大类

  breed = ""; // 品种

  color = ""; // 花色

  birthDate: string = new Date().toISOString(); // 生日（ISO格式字符串）

  arrivalDate: string = new Date().toISOString(); // 到家日期（ISO格式字符串）

  totalIncome = 0; // 单猫收益总计

  totalExpense = 0; // 单猫支出总计

  petStatusId: number; // 宠物状态

  weight = 0; // 体重

  isPregnant = false; // 是否怀孕

  isSick = false; // 是否生病

  isVaccinated = false; // 近期是否接种疫苗

  isDewormed = false; // 近期是否驱虫

  constructor(name = "") {
    this.name = name;
  }

  static buildStatusFilters(
    filters: Pick<
      CatFilters,
      "isPregnant" | "isSick" | "isVaccinated" | "isDewormed"
    >
  ): Partial<Cat> {
    const where: Partial<Cat> = {};
    if (filters.isPregnant !== undefined) where.isPregnant = filters.isPregnant;
    if (filters.isSick !== undefined) where.isSick = filters.isSick;
    if (filters.isVaccinated !== undefined)
      where.isVaccinated = filters.isVaccinated;
    if (filters.isDewormed !== undefined) where.isDewormed = filters.isDewormed;
    return where;
  }
}
