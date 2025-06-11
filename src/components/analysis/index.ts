import { WeightAnalysis } from "./WeightAnalysis";
import { analysisRegistry } from "../../config/analysisRegistry";
import React from "react";

// 注册体重分析模块
analysisRegistry.register({
  id: "weight",
  name: "体重趋势",
  description: "展示猫咪体重变化趋势",
  component: React.createElement(WeightAnalysis, {
    data: { type: "weight", timeRange: "", data: [] },
  }),
});

// 导出所有分析模块组件
export { WeightAnalysis } from "./WeightAnalysis";
