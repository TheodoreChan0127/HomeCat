/* eslint-disable import/no-unresolved */
import { getItem, setItem } from "./storage";

export interface PregnancySettings {
  pregnancyDuration: number; // 默认怀孕天数
  enableReminders: boolean; // 是否启用怀孕提醒
}

const DEFAULT_SETTINGS: PregnancySettings = {
  pregnancyDuration: 63,
  enableReminders: true,
};

const STORAGE_KEY = "pregnancy_settings";

export const getPregnancySettings = (): PregnancySettings => {
  const settings = getItem<PregnancySettings>(STORAGE_KEY);
  return settings || DEFAULT_SETTINGS;
};

export const savePregnancySettings = (settings: PregnancySettings): void => {
  setItem(STORAGE_KEY, settings);
};
