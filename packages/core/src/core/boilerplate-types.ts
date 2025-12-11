/**
 * Boilerplate metadata types for the new metadata-driven resolution system.
 * These types support the `.boilerplate.json` and `.boilerplates.json` configuration files.
 */

/**
 * A question to prompt the user during template scaffolding.
 */
export interface BoilerplateQuestion {
  /** The placeholder name in templates (e.g., "____fullName____") */
  name: string;
  /** The prompt message shown to the user */
  message: string;
  /** Whether the question is required */
  required?: boolean;
  /** The type of input: text, list (single select), or checkbox (multi select) */
  type?: 'text' | 'list' | 'checkbox';
  /** Options for list or checkbox types */
  options?: string[];
  /** Source to derive default value from (e.g., "git.user.name", "npm.whoami") */
  defaultFrom?: string;
}

/**
 * Configuration for a single boilerplate template.
 * Stored in `.boilerplate.json` within each template directory.
 */
export interface BoilerplateConfig {
  /** The type of boilerplate: workspace or module */
  type: 'workspace' | 'module';
  /** Questions to prompt the user during scaffolding */
  questions?: BoilerplateQuestion[];
}

/**
 * Root configuration for a boilerplates repository.
 * Stored in `.boilerplates.json` at the repository root.
 */
export interface BoilerplatesRootConfig {
  /** The default directory containing boilerplate templates (e.g., "default") */
  dir: string;
}

/**
 * A scanned boilerplate with its resolved path and configuration.
 */
export interface ScannedBoilerplate {
  /** The boilerplate folder name (e.g., "module", "workspace") */
  name: string;
  /** The full path to the boilerplate directory */
  path: string;
  /** The type of boilerplate */
  type: 'workspace' | 'module';
  /** Questions from the boilerplate config */
  questions?: BoilerplateQuestion[];
}

