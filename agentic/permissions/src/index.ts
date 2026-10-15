/**
 * `@agentic-kit/permissions` — harness-neutral permissions for a coding agent:
 * tool-call classification, the workspace boundary, bash risk signals, modes,
 * grants, and secret redaction.
 */

export { nodeFsProbe } from './node-fs';
export {
  defaultHardDeny,
  defaultTempDirs,
  HOME_HARD_DENY,
  type KnownPath,
  WORKSPACE_ASK_WRITE,
  WORKSPACE_PROTECTED_WRITE
} from './roots';
export { isSecretFile, isSecretFileName } from './secret-files';
export * from './types';
