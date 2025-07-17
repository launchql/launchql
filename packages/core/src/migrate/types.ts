import { PgConfig } from 'pg-env';

export interface MigrateChange {
  name: string;
  dependencies: string[];
  timestamp?: string;
  planner?: string;
  email?: string;
  comment?: string;
}

export interface MigratePlanFile {
  project: string;
  uri?: string;
  changes: MigrateChange[];
}

export interface DeployOptions {
  project: string;
  targetDatabase: string;
  planPath: string;
  toChange?: string;
  useTransaction?: boolean;
}

export interface RevertOptions {
  project: string;
  targetDatabase: string;
  planPath: string;
  toChange?: string;
  useTransaction?: boolean;
}

export interface VerifyOptions {
  project: string;
  targetDatabase: string;
  planPath: string;
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
