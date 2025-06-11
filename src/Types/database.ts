import { Table } from "dexie";
import { db } from "../db/DBManager";

// 定义表名类型
export type TableName =
  | "cats"
  | "purchases"
  | "goodsSales"
  | "kittenSales"
  | "illnesses"
  | "vaccinationRecords"
  | "internalDewormings"
  | "externalDewormings"
  | "pregnancies"
  | "weightRecords";

// 定义表信息接口
export interface TableInfo {
  name: string;
  count: number;
}

// 定义数据库表引用映射
export const dbTables: Record<TableName, Table> = {
  cats: db.cats,
  purchases: db.purchases,
  goodsSales: db.goodsSales,
  kittenSales: db.kittenSales,
  illnesses: db.illnesses,
  vaccinationRecords: db.vaccinationRecords,
  internalDewormings: db.internalDewormings,
  externalDewormings: db.externalDewormings,
  pregnancies: db.pregnancies,
  weightRecords: db.weightRecords,
};
