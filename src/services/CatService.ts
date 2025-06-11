import { Cat } from "../entity/Cat";
import { CatDbProxy } from "../db/CatDbProxy";
import { getConfigSettings } from "../config/configSettings";
import dayjs from "dayjs";

export class CatService {
  private static instance: CatService;
  private db: typeof CatDbProxy;

  private constructor() {
    this.db = CatDbProxy;
  }

  public static getInstance(): CatService {
    if (!CatService.instance) {
      CatService.instance = new CatService();
    }
    return CatService.instance;
  }

  // 更新猫咪状态
  public async updateCatStatus(cat: Cat): Promise<void> {
    const config = getConfigSettings();

    // 更新怀孕状态
    await this.updatePregnancyStatus(cat);

    // 更新生病状态
    await this.updateSickStatus(cat);

    // 更新疫苗状态
    await this.updateVaccinationStatus(cat, config.vaccineReminderInterval);

    // 更新驱虫状态
    await this.updateDewormStatus(
      cat,
      config.externalDewormingInterval,
      config.internalDewormingInterval
    );

    // 保存更新后的猫咪信息
    await this.db.updateCat(cat);
  }

  // 更新所有猫咪状态
  public async updateAllCatsStatus(): Promise<void> {
    const cats = await this.db.getCats({
      currentPage: 1,
      itemsPerPage: 100,
      filters: {},
    });

    for (const cat of cats.data) {
      await this.updateCatStatus(cat);
    }
  }

  // 更新怀孕状态
  private async updatePregnancyStatus(cat: Cat): Promise<void> {
    const pregnancies = await this.db.getPregnanciesByCatId(cat.id);
    if (pregnancies.length > 0) {
      const currentPregnancy = pregnancies[pregnancies.length - 1];
      cat.isPregnant = !currentPregnancy.isDelivered;
    } else {
      cat.isPregnant = false;
    }
  }

  // 更新生病状态
  private async updateSickStatus(cat: Cat): Promise<void> {
    const illnesses = await this.db.getIllnessesByCatId(cat.id);
    if (illnesses.length > 0) {
      const currentIllness = illnesses[illnesses.length - 1];
      cat.isSick = !currentIllness.isCured;
    } else {
      cat.isSick = false;
    }
  }

  // 更新疫苗状态
  private async updateVaccinationStatus(
    cat: Cat,
    interval: number
  ): Promise<void> {
    const vaccinations = await this.db.getVaccinationsByCatId(cat.id);
    if (vaccinations.length > 0) {
      const lastVaccination = vaccinations[vaccinations.length - 1];
      const lastVaccinationDate = dayjs(lastVaccination.injectionDate);
      const today = dayjs();
      cat.isVaccinated = today.diff(lastVaccinationDate, "day") <= interval;
    } else {
      cat.isVaccinated = false;
    }
  }

  // 更新驱虫状态
  private async updateDewormStatus(
    cat: Cat,
    externalInterval: number,
    internalInterval: number
  ): Promise<void> {
    const externalDewormings = await this.db.getExternalDewormingsByCatId(
      cat.id
    );
    const internalDewormings = await this.db.getInternalDewormingsByCatId(
      cat.id
    );

    let isExternalDewormed = false;
    let isInternalDewormed = false;

    if (externalDewormings.length > 0) {
      const lastExternalDeworm =
        externalDewormings[externalDewormings.length - 1];
      const lastExternalDewormDate = dayjs(lastExternalDeworm.dewormingDate);
      const today = dayjs();
      isExternalDewormed =
        today.diff(lastExternalDewormDate, "day") <= externalInterval;
    }

    if (internalDewormings.length > 0) {
      const lastInternalDeworm =
        internalDewormings[internalDewormings.length - 1];
      const lastInternalDewormDate = dayjs(lastInternalDeworm.dewormingDate);
      const today = dayjs();
      isInternalDewormed =
        today.diff(lastInternalDewormDate, "day") <= internalInterval;
    }

    cat.isDewormed = isExternalDewormed && isInternalDewormed;
  }
}
