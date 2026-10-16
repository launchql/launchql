/**
 * The permission engine: classify a tool call, decide it against the mode,
 * the grants and the fixed lists, and keep secrets out of what the model sees.
 *
 * Harness-neutral. A harness adapter (the pi lane in `@agentic-kit/pi`) owns the
 * glue: call `evaluate` on a tool call and show `decision.prompt` on an ask,
 * call `restoreInput` with the decision before the tool runs, and
 * `redactResult` on every result. The engine holds no state about one call
 * between those steps: the decision carries all of it.
 */

import { randomBytes } from 'node:crypto';
import * as path from 'node:path';

import { classify } from './classify';
import { nodeFsProbe } from './node-fs';
import { decide, type PolicyRules } from './policy';
import { buildHostHardDeny, buildRoots, type Roots } from './roots';
import { isSecretFile } from './secret-files';
import { collectWorkspaceSecrets, isSecretEntry, redactToolResult, SecretVault } from './secrets';
import { mapCommand, mapWriteTexts } from './tool-input';
import {
  type FsProbe,
  type Grant,
  isBuiltinTool,
  type PermissionDecision,
  type PermissionMode,
  type PermissionRequest,
  TOOL_KIND
} from './types';

/**
 * The fixed paths a host knows about. Every entry is an absolute path (a file
 * or a directory, matched as "equal or inside") unless it says otherwise.
 */
export interface RootsInput {
  /** The project folders. Defaults to `[cwd]`. */
  workspace?: string[];
  /** Read-only roots the agent needs (skills, prompts, harness docs). Writes there are DENY. */
  trustedRead?: string[];
  /** Roots the agent may read and run from (harness scripts). Writes there are DENY. */
  trustedExec?: string[];
  /** Scratch dirs: read and write without a prompt. Defaults to the OS temp dirs. */
  temp?: string[];
  /** Added to the built-in credential list (`defaultHardDeny(homeDir)`). Read, write and run are DENY. */
  hardDeny?: string[];
  /** Absolute paths whose writes are DENY in every mode (the permission store, the agent dir). */
  protectedWrite?: string[];
  /** Added to the per-workspace ask-write list (`.git/hooks`, `.husky`, …). Writes ask outside Full mode. */
  askWrite?: string[];
}

export interface SecretSourceInput {
  /** Extra secret values the host knows of (a key it just minted). Name → value. */
  values?: Record<string, string>;
  /**
   * The environment the tools run with. Values whose names look secret (or
   * that are token-shaped) are redacted too, so `env | grep TOKEN` shows
   * placeholders. Kept across refreshes.
   */
  env?: Record<string, string | undefined>;
}

export interface PermissionEngineOptions {
  cwd: string;
  homeDir: string;
  roots?: RootsInput;
  /**
   * More hard-deny paths, listed again at every decision: entries that can
   * appear while a session runs (another tool's data dir, a new store file).
   * A throw fails the decision, and the call is blocked.
   */
  liveHardDeny?: () => Promise<readonly string[]>;
  /** Defaults to the Node fs (`nodeFsProbe`). */
  fs?: FsProbe;
  /** Per-install HMAC key for placeholder suffixes. Without one, a random key per engine. */
  placeholderKey?: string;
  /** Non-fatal problems (an unreadable `.env`): the engine goes on with what it has. */
  onError?: (error: unknown, where: string) => void;
}

export interface ToolCallInput {
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
}

export interface EvaluateContext {
  mode: PermissionMode;
  /** Chat and project grants together; the engine checks chat grants first. */
  grants: readonly Grant[];
  /** User allow and deny rules. Reserved: v1 has no rule editor. */
  rules?: PolicyRules;
}

export interface ToolResultInput {
  toolName: string;
  content: readonly unknown[];
  details?: unknown;
}

export interface RedactedResult {
  content: unknown[];
  details?: unknown;
  /** `true` when at least one value was replaced. */
  changed: boolean;
}

export interface PermissionEngine {
  /**
   * Classify and decide one tool call. Returns `null` for a tool this layer
   * does not own (anything that is not a pi built-in), so the next gate decides.
   */
  evaluate(call: ToolCallInput, context: EvaluateContext): Promise<PermissionDecision | null>;
  /**
   * Put real secret values back into the call's input, in place, where that is
   * safe: a write or edit to a secret file always, a bash command only when
   * `approved` (a person saw the placeholder in the command and allowed it).
   */
  restoreInput(decision: PermissionDecision, input: Record<string, unknown>, options?: { approved?: boolean }): void;
  /**
   * Replace known secret values in a tool result with placeholders. After a
   * tool that can write, the vault first re-reads the workspace secret files,
   * so a value that tool just wrote is already known. Throws on failure; the
   * caller fails closed.
   */
  redactResult(result: ToolResultInput): Promise<RedactedResult>;
  /** Re-read the workspace secret files, and take in host values and env. */
  refreshSecrets(extra?: SecretSourceInput): Promise<void>;
  /** Add a value the host knows is secret (a minted API key). */
  addSecret(name: string, value: string): void;
}

const MIN_HOST_SECRET = 4;

/** A write or edit to a file that is secret under both its own name and its real name. */
function writesSecretFile(request: PermissionRequest): boolean {
  if (request.toolName !== 'write' && request.toolName !== 'edit') return false;
  const target = request.targets[0];
  return Boolean(target) && target.zone !== 'unresolvable' && isSecretFile(target.path) && isSecretFile(target.raw);
}

export function createPermissionEngine(options: PermissionEngineOptions): PermissionEngine {
  const fs = options.fs ?? nodeFsProbe;
  const cwd = path.resolve(options.cwd);
  const homeDir = path.resolve(options.homeDir);
  const vault = new SecretVault(options.placeholderKey ?? randomBytes(32).toString('hex'));
  const report = (error: unknown, where: string) => options.onError?.(error, where);

  let rootsReady: Promise<Roots> | undefined;
  const getRoots = (): Promise<Roots> => (rootsReady ??= buildRoots({ cwd, homeDir, ...options.roots }, fs));
  const decisionRoots = async (): Promise<Roots> => {
    const roots = await getRoots();
    if (!options.liveHardDeny) return roots;
    const live = await buildHostHardDeny(await options.liveHardDeny(), fs);
    return { ...roots, hardDeny: [...roots.hardDeny, ...live] };
  };

  let hostEnv: Record<string, string | undefined> = {};
  /** The env names whose values are secret: `$NAME` in a command asks. */
  const secretEnvNames = new Set<string>();
  const addHostSecret = (name: string, value: string | undefined) => {
    if (value && value.length >= MIN_HOST_SECRET) vault.add(name, value, 'host');
  };

  const refresh = async (extra?: SecretSourceInput): Promise<void> => {
    for (const [name, value] of Object.entries(extra?.values ?? {})) addHostSecret(name, value);
    if (extra?.env) hostEnv = { ...hostEnv, ...extra.env };
    for (const [name, value] of Object.entries(hostEnv)) {
      if (!value || !isSecretEntry(name, value)) continue;
      vault.add(name, value, 'host');
      secretEnvNames.add(name);
    }
    const roots = await getRoots();
    const collected = await collectWorkspaceSecrets(
      roots.workspace.map((w) => w.path),
      fs
    );
    for (const { file, error } of collected.errors) report(error, `secrets: ${file}`);
    vault.clear('file');
    for (const { name, value } of collected.values) vault.add(name, value, 'file');
  };

  // The first read of the workspace secrets happens lazily, once; every later
  // refresh replaces it.
  let vaultReady: Promise<void> | undefined;
  const refreshReported = (extra?: SecretSourceInput): Promise<void> =>
    (vaultReady = refresh(extra).catch((error) => report(error, 'secrets')));
  const ensureVault = (): Promise<void> => vaultReady ?? refreshReported();

  const restore = (text: string) => vault.restore(text);

  return {
    async evaluate(call, context) {
      const { toolName } = call;
      if (!isBuiltinTool(toolName)) return null;
      const [roots] = await Promise.all([decisionRoots(), ensureVault()]);
      const request = await classify(
        { toolCallId: call.toolCallId, toolName, input: call.input ?? {} },
        { cwd, homeDir, roots, fs, vault, secretEnvNames }
      );
      return decide(request, { ...context, workspace: roots.workspace[0]?.path, homeDir });
    },

    restoreInput(decision, input, restoreOptions) {
      if (decision.request.toolName === 'bash') {
        if (restoreOptions?.approved) mapCommand(input, restore);
      } else if (writesSecretFile(decision.request)) {
        mapWriteTexts(input, restore);
      }
    },

    async redactResult(result) {
      // A built-in that only reads cannot change a file, so the vault needs no refresh after it.
      const readOnly = isBuiltinTool(result.toolName) && TOOL_KIND[result.toolName] === 'read';
      if (!readOnly) await refreshReported();
      return redactToolResult(vault, result.content, result.details);
    },

    refreshSecrets: (extra) => refreshReported(extra),

    addSecret: addHostSecret
  };
}
