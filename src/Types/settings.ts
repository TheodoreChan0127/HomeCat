import { ReactNode } from "react";

export interface SettingsModule {
  key: string;
  title: string;
  icon: string;
  component: () => ReactNode;
}

export interface PregnancySettings {
  pregnancyDuration: number;
  enableReminders: boolean;
}
