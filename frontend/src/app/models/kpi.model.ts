export interface KPI {
  nwb: string;
  team: string;
  tribe: string;
  product: string;
  deploymentFrequency: number;
  cycleTime: number;
  changeFailureRate: number;
  mttr: number;
  cicdPipeline: number;
  testAutomation: number;
  devOpsScore: number;
  quarter: string;
  year: number;
}

export interface TeamCount {
  nwb: string;
  count: number;
}
