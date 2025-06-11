import { ReactNode } from "react";

export interface AnalysisModule {
  id: string;
  name: string;
  description: string;
  component: ReactNode;
}

export interface AnalysisData {
  type: string;
  timeRange: string;
  data: any[];
}

export interface AnalysisModuleProps {
  data: AnalysisData;
  onDataChange?: (data: AnalysisData) => void;
}
