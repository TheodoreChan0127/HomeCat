// eslint-disable-next-line import/no-named-as-default
import Dexie from "dexie";
import { Cat } from "../entity/Cat";
import { ExternalDeworming } from "../entity/ExternalDeworming";
import { Illness } from "../entity/Illness";
import { InternalDeworming } from "../entity/InternalDeworming";
import { PetStatus } from "../entity/PetStatus";
import { Pregnant } from "../entity/Pregnant";
import { VaccinationRecord } from "../entity/VaccinationRecord";
import { WeightRecord } from "../entity/WeightRecord";

export class DBManager extends Dexie {
  cats: Dexie.Table<Cat, number>;
  petStatuses: Dexie.Table<PetStatus, number>;
  externalDewormings: Dexie.Table<ExternalDeworming, number>;
  internalDewormings: Dexie.Table<InternalDeworming, number>;
  illnesses: Dexie.Table<Illness, number>;
  pregnancies: Dexie.Table<Pregnant, number>;
  vaccinationRecords: Dexie.Table<VaccinationRecord, number>;
  weightRecords: Dexie.Table<WeightRecord, number>;

  constructor() {
    super("HomeCatDB");
    this.version(1).stores({
      cats: "++id, name, breed, age, isPregnant, isSick, isVaccinated, isDewormed, fatherId, motherId, color, birthDate, arrivalDate, totalIncome, totalExpense, weight",
      petStatuses: "++id, catId, lastWeightDate",
      externalDewormings: "++id, petStatusId, dewormingDate",
      internalDewormings: "++id, petStatusId, dewormingDate",
      illnesses: "++id, petStatusId, illnessName",
      pregnancies: "++id, petStatusId, matingDate, expectedDeliveryDate",
      vaccinationRecords: "++id, petStatusId, injectionDate",
      weightRecords: "++id, petStatusId, weighDate",
    });
    this.cats = this.table("cats");
    this.petStatuses = this.table("petStatuses");
    this.externalDewormings = this.table("externalDewormings");
    this.internalDewormings = this.table("internalDewormings");
    this.illnesses = this.table("illnesses");
    this.pregnancies = this.table("pregnancies");
    this.vaccinationRecords = this.table("vaccinationRecords");
    this.weightRecords = this.table("weightRecords");
  }
}

export const db = new DBManager();
