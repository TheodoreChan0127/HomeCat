// eslint-disable-next-line import/no-named-as-default
import Dexie from "dexie";
import { Cat } from "../entity/Cat";
import { ExternalDeworming } from "../entity/ExternalDeworming";
import { Illness } from "../entity/Illness";
import { InternalDeworming } from "../entity/InternalDeworming";
import { Pregnant } from "../entity/Pregnant";
import { VaccinationRecord } from "../entity/VaccinationRecord";
import { WeightRecord } from "../entity/WeightRecord";

export class DBManager extends Dexie {
  cats: Dexie.Table<Cat, number>;
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
      // Add catId to all related stores:
      externalDewormings: "++id, catId, dewormingDate", // Changed from "++id, Id, dewormingDate"
      internalDewormings: "++id, catId, dewormingDate", // Changed from "++id, Id, dewormingDate"
      illnesses: "++id, catId, illnessName", // Changed from "++id, Id, illnessName"
      pregnancies: "++id, catId, matingDate, expectedDeliveryDate", // Changed from "++id, Id, matingDate, expectedDeliveryDate"
      vaccinationRecords: "++id, catId, injectionDate", // Changed from "++id, Id, injectionDate"
      weightRecords: "++id, catId, weighDate", // Changed from "++id, Id, weighDate"
    });
    this.cats = this.table("cats");
    this.externalDewormings = this.table("externalDewormings");
    this.internalDewormings = this.table("internalDewormings");
    this.illnesses = this.table("illnesses");
    this.pregnancies = this.table("pregnancies");
    this.vaccinationRecords = this.table("vaccinationRecords");
    this.weightRecords = this.table("weightRecords");
  }
}

export const db = new DBManager();
