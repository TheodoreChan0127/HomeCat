import { db } from "./DBManager";
import { Cat } from "../entity/Cat";
import { Illness } from "../entity/Illness";
import { VaccinationRecord } from "../entity/VaccinationRecord";
import { ExternalDeworming } from "../entity/ExternalDeworming";
import { InternalDeworming } from "../entity/InternalDeworming";

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

  public static async exportCats(): Promise<Cat[]> {
    return await db.cats.toArray();
  }

  public static async importCats(cats: Cat[]): Promise<void> {
    await db.cats.bulkPut(cats);
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
  // 可扩展其他API：updateCat、deleteCat等
}
