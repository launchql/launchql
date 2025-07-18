export interface MigrateTestChange {
  name: string;
  dependencies?: string[];
  timestamp?: string;
  planner?: string;
  email?: string;
  comment?: string;
}
