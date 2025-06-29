import { PgConfig } from 'pg-env';
export { SqitchChange, SqitchPlan } from '@launchql/types';

export interface DeployOptions {
  project: string;
  targetDatabase: string;
  planPath: string;
  deployPath: string;
  verifyPath?: string;
  toChange?: string;
  useTransaction?: boolean;
}

export interface RevertOptions {
  project: string;
  targetDatabase: string;
  planPath: string;
  revertPath: string;
  toChange?: string;
  useTransaction?: boolean;
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