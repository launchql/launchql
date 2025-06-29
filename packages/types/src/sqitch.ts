// Shared Sqitch types for both migrate and core modules

export interface SqitchChange {
  name: string;
  dependencies: string[];
  timestamp?: string;
  planner?: string;
  email?: string;
  note?: string;
}

export interface SqitchPlan {
  project: string;
  uri?: string;
  changes: SqitchChange[];
}

export interface SqitchPlanEntry {
  name: string;
  dependencies?: string[];
  timestamp?: string;
  planner?: string;
  email?: string;
  note?: string;
}