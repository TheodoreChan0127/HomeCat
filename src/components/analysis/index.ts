import { WeightAnalysis } from "./WeightAnalysis";
import { FinanceAnalysis } from "./FinanceAnalysis";
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

// 注册财务分析模块
analysisRegistry.register({
  id: "finance",
  name: "财务分析",
  description: "展示猫舍收支情况和售出小猫数量",
  component: React.createElement(FinanceAnalysis, {
    data: { type: "finance", timeRange: "", data: [] },
  }),
});

// 导出所有分析模块组件
export { WeightAnalysis } from "./WeightAnalysis";
export { FinanceAnalysis } from "./FinanceAnalysis";
