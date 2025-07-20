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
  modulePath: string;
  toChange?: string;
  useTransaction?: boolean;
  // Add debug mode for enhanced error reporting
  debug?: boolean;
  logOnly?: boolean;
}

export interface RevertOptions {
  modulePath: string;
  toChange?: string;
  useTransaction?: boolean;
  // Add debug mode for enhanced error reporting
  debug?: boolean;
}

export interface VerifyOptions {
  modulePath: string;
  toChange?: string;
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
