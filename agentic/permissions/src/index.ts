/**
 * `@agentic-kit/permissions` — harness-neutral permissions for a coding agent:
 * tool-call classification, the workspace boundary, bash risk signals, modes,
 * grants, and secret redaction.
 *
 * No harness SDK is imported here. An adapter (the pi lane in `@agentic-kit/pi`)
 * calls `evaluate` on each tool call, shows `decision.prompt` through its
 * approval channel on `ask`, calls `restoreInput` before the tool runs and
 * `redactResult` after. Classification, the policy and the vault stay internal.
 */

export {
  createPermissionEngine,
  type EvaluateContext,
  type PermissionEngine,
  type PermissionEngineOptions,
  type RedactedResult,
  type RootsInput,
  type SecretSourceInput,
  type ToolCallInput,
  type ToolResultInput
} from './engine';
export { scrubEnv } from './env';
export { describeGrant, grantFrom, type GrantStore, memoryGrantStore, NEVER_GRANTED, sameMatch } from './grants';
export { nodeFsProbe } from './node-fs';
export type { PolicyRules } from './policy';
export {
  defaultHardDeny,
  defaultTempDirs,
  HOME_HARD_DENY,
  type KnownPath,
  WORKSPACE_ASK_WRITE,
  WORKSPACE_PROTECTED_WRITE
} from './roots';
export { isSecretFile, isSecretFileName } from './secret-files';
export { findPlaceholders, PLACEHOLDER_PATTERN } from './secrets';
export * from './types';
