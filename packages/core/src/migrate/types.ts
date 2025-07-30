
export interface MigrateChange {
  name: string;
  dependencies: string[];
  timestamp?: string;
  planner?: string;
  email?: string;
  comment?: string;
}

export interface MigratePlanFile {
  package: string;
  uri?: string;
  changes: MigrateChange[];
}

export interface DeployOptions {
  modulePath: string;
  /** 
   * Target change name or tag (e.g., "changeName" or "@tagName").
   * Note: Project name is already resolved upstream by LaunchQLPackage.
   */
  toChange?: string;
  useTransaction?: boolean;
  // Add debug mode for enhanced error reporting
  debug?: boolean;
  logOnly?: boolean;
}

export interface RevertOptions {
  modulePath: string;
  /** 
   * Target change name or tag (e.g., "changeName" or "@tagName").
   * Note: Project name is already resolved upstream by LaunchQLPackage.
   */
  toChange?: string;
  useTransaction?: boolean;
  // Add debug mode for enhanced error reporting
  debug?: boolean;
}

export interface VerifyOptions {
  modulePath: string;
  /** 
   * Target change name or tag (e.g., "changeName" or "@tagName").
   * Note: Project name is already resolved upstream by LaunchQLPackage.
   */
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
  package: string;
  totalDeployed: number;
  lastChange: string;
  lastDeployed: Date;
}
