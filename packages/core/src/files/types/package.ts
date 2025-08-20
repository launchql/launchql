export interface PackageAnalysisIssue {
  code: string;
  message: string;
  file?: string;
  fixable?: boolean;
}

export interface PackageAnalysisResult {
  ok: boolean;
  name: string;
  path: string;
  issues: PackageAnalysisIssue[];
}

export interface RenameOptions {
  dryRun?: boolean;
  syncPackageJsonName?: boolean;
}

export interface RenameResult {
  changed: string[];
  warnings: string[];
}
