// eslint-disable-next-line import/no-named-as-default
import Dexie, { Table } from "dexie";
import { Cat } from "../entity/Cat";
import { ExternalDeworming } from "../entity/ExternalDeworming";
import { Illness } from "../entity/Illness";
import { InternalDeworming } from "../entity/InternalDeworming";
import { Pregnant } from "../entity/Pregnant";
import { VaccinationRecord } from "../entity/VaccinationRecord";
import { WeightRecord } from "../entity/WeightRecord";
import { Purchase } from "../entity/Purchase";
import { GoodsSale } from "../entity/GoodsSale";
import { KittenSale } from "../entity/KittenSale";
import { Todo } from "../entity/Todo";
import { MonthlyStats } from "../entity/MonthlyStats";

export class DBManager extends Dexie {
  cats!: Table<Cat, number>;
  externalDewormings: Dexie.Table<ExternalDeworming, number>;
  internalDewormings: Dexie.Table<InternalDeworming, number>;
  illnesses: Dexie.Table<Illness, number>;
  pregnancies: Dexie.Table<Pregnant, number>;
  vaccinationRecords: Dexie.Table<VaccinationRecord, number>;
  weightRecords: Dexie.Table<WeightRecord, number>;
  purchases!: Table<Purchase, number>;
  goodsSales!: Table<GoodsSale, number>;
  kittenSales!: Table<KittenSale, number>;
  todos!: Table<Todo, number>;
  monthlyStats!: Table<MonthlyStats, number>;

  constructor() {
    super("HomeCatDB");
    this.version(1).stores({
      cats: "++id, name, gender, breed, birthDate, fatherId, motherId, totalIncome, totalExpense",
      externalDewormings:
        "++id, catId, medicineName, dewormingDate, nextDewormingDate",
      internalDewormings:
        "++id, catId, medicineName, dewormingDate, nextDewormingDate",
      illnesses: "++id, catId, name, startDate, endDate, cost, notes",
      pregnancies:
        "++id, catId, startDate, endDate, expectedDeliveryDate, actualDeliveryDate, kittenCount, notes",
      vaccinationRecords:
        "++id, catId, vaccineName, vaccinationDate, nextVaccinationDate",
      weightRecords: "++id, catId, weight, recordDate",
      purchases: "++id, item, amount, isSingleCat, catId, purchaseDate",
      goodsSales: "++id, item, amount, saleDate",
      kittenSales: "++id, kittenId, amount, saleDate",
      todos: "++id, catId, content, status, created_at, updated_at",
      monthlyStats:
        "++id, year, month, totalIncome, totalExpense, kittenCount, [year+month]",
    });
    this.externalDewormings = this.table("externalDewormings");
    this.internalDewormings = this.table("internalDewormings");
    this.illnesses = this.table("illnesses");
    this.pregnancies = this.table("pregnancies");
    this.vaccinationRecords = this.table("vaccinationRecords");
    this.weightRecords = this.table("weightRecords");
    this.purchases = this.table("purchases");
    this.goodsSales = this.table("goodsSales");
    this.kittenSales = this.table("kittenSales");
    this.todos = this.table("todos");
    this.monthlyStats = this.table("monthlyStats");
  }
}

export const db = new DBManager();
