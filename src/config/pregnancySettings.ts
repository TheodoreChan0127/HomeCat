/* eslint-disable import/no-unresolved */
import { PregnancySettings } from "../Types/settings";

const PREGNANCY_SETTINGS_KEY = "pregnancy_settings";

export const getPregnancySettings = (): PregnancySettings => {
  const defaultSettings: PregnancySettings = {
    pregnancyDuration: 63,
    enableReminders: true,
  };

  const savedSettings = localStorage.getItem(PREGNANCY_SETTINGS_KEY);
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (error) {
      console.error("解析怀孕设置失败:", error);
      return defaultSettings;
    }
  }
  return defaultSettings;
};

export const savePregnancySettings = (settings: PregnancySettings): void => {
  try {
    localStorage.setItem(PREGNANCY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("保存怀孕设置失败:", error);
  }
};
