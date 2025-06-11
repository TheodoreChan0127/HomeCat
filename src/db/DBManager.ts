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

  constructor() {
    super("HomeCatDB");
    this.version(1).stores({
      cats: "++id, name, breed, age, isPregnant, isSick, isVaccinated, isDewormed, fatherId, motherId, color, birthDate, arrivalDate, totalIncome, totalExpense, weight",
      // Add catId to all related stores:
      externalDewormings: "++id, catId, dewormingDate, reminderDate",
      internalDewormings: "++id, catId, dewormingDate, reminderDate",
      illnesses: "++id, catId, illnessName, treatmentMethod",
      pregnancies:
        "++id, catId, matingDate, expectedDeliveryDate, reminder7Days, reminder3Days, reminder1Day, isDelivered, deliveryCount, notes",
      vaccinationRecords: "++id, catId, injectionDate",
      weightRecords: "++id, catId, weighDate",
      purchases:
        "++id, itemName, amount, purchaseDate, catId, createdAt, updatedAt",
      goodsSales: "++id, itemName, amount, saleDate, createdAt, updatedAt",
      kittenSales: "++id, catId, amount, saleDate, createdAt, updatedAt",
      todos:
        "++id, catId, reminderId, title, description, dueDate, status, created_at, updated_at",
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
  }
}

export const db = new DBManager();
