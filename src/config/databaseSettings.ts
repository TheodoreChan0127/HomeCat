import { getItem, setItem } from "./storage";

export interface DatabaseInfo {
  name: string;
  size: string;
  lastUpdate: string;
}

const DEFAULT_INFO: DatabaseInfo = {
  name: "HomeCat.db",
  size: "0 KB",
  lastUpdate: new Date().toLocaleString(),
};

const STORAGE_KEY = "database_info";

export const getDatabaseInfo = (): DatabaseInfo => {
  const info = getItem<DatabaseInfo>(STORAGE_KEY);
  return info || DEFAULT_INFO;
};

export const saveDatabaseInfo = (info: DatabaseInfo): void => {
  setItem(STORAGE_KEY, info);
};
