import { AnalysisModule } from "../Types/analysis";

class AnalysisRegistry {
  private modules: Map<string, AnalysisModule> = new Map();

  register(module: AnalysisModule) {
    this.modules.set(module.id, module);
  }

  getModule(id: string): AnalysisModule | undefined {
    return this.modules.get(id);
  }

  getAllModules(): AnalysisModule[] {
    return Array.from(this.modules.values());
  }
}

export const analysisRegistry = new AnalysisRegistry();
