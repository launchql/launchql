import { PgConfig } from 'pg-env';

export interface Change {
  name: string;
  dependencies: string[];
  timestamp?: string;
  planner?: string;
  email?: string;
  comment?: string;
}

export interface PlanFile {
  project: string;
  uri?: string;
  changes: Change[];
}

export interface DeployOptions {
  project: string;
  targetDatabase: string;
  planPath: string;
  deployPath: string;
  verifyPath?: string;
  toChange?: string;
}

export interface RevertOptions {
  project: string;
  targetDatabase: string;
  planPath: string;
  revertPath: string;
  toChange?: string;
}

export interface VerifyOptions {
  project: string;
  targetDatabase: string;
  planPath: string;
  verifyPath: string;
}

export interface DeployResult {
  deployed: string[];
  skipped: string[];
  failed?: string;
}

export interface RevertResult {
  reverted: string[];
  skipped: string[];
  failed?: string;
}

export interface VerifyResult {
  verified: string[];
  failed: string[];
}

export interface StatusResult {
  project: string;
  totalDeployed: number;
  lastChange: string;
  lastDeployed: Date;
}

export interface MigrateConfig extends PgConfig {
  // Additional config options can be added here
}