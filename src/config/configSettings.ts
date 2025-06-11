import { getItem, setItem } from "./storage";

export interface ConfigSettings {
  weightReminderInterval: number; // 称重提醒间隔（天）
  vaccineReminderInterval: number; // 疫苗注射提醒间隔（天）
  externalDewormingInterval: number; // 体外驱虫提醒间隔（天）
  internalDewormingInterval: number; // 体内驱虫提醒间隔（天）
  ageReminderInterval: number; // 年龄提醒间隔（天）
}

const DEFAULT_SETTINGS: ConfigSettings = {
  weightReminderInterval: 30,
  vaccineReminderInterval: 365,
  externalDewormingInterval: 90,
  internalDewormingInterval: 90,
  ageReminderInterval: 30,
};

const STORAGE_KEY = "config_settings";

export const getConfigSettings = (): ConfigSettings => {
  const settings = getItem<ConfigSettings>(STORAGE_KEY);
  return settings || DEFAULT_SETTINGS;
};

export const saveConfigSettings = (settings: ConfigSettings): void => {
  setItem(STORAGE_KEY, settings);
};
