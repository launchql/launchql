/**
 * The shared vocabulary of the permissions layer. Everything here is plain data
 * so a host can store it, show it, and assert on it in a test.
 */

/** How much the agent may do without asking. The hard-deny list, redaction and
 * self-protection apply in every mode; the mode only moves the defaults. */
export type PermissionMode = 'ask' | 'workspace' | 'full';

export const PERMISSION_MODES: readonly PermissionMode[] = ['ask', 'workspace', 'full'];

export const DEFAULT_PERMISSION_MODE: PermissionMode = 'workspace';

/** The pi built-in tools this layer owns. Every other tool belongs to another
 * gate (the DB gate) or to trusted host code, and the layer abstains on it. */
export type BuiltinTool = 'read' | 'write' | 'edit' | 'bash' | 'grep' | 'find' | 'ls';

export type Access = 'read' | 'write' | 'exec';

export type RequestKind = 'read' | 'write' | 'exec';

/** What each built-in does: the request kind it makes. */
export const TOOL_KIND: Readonly<Record<BuiltinTool, RequestKind>> = {
  read: 'read',
  write: 'write',
  edit: 'write',
  bash: 'exec',
  grep: 'read',
  find: 'read',
  ls: 'read'
};

export const BUILTIN_TOOLS: ReadonlySet<string> = new Set(Object.keys(TOOL_KIND));

export function isBuiltinTool(name: string): name is BuiltinTool {
  return BUILTIN_TOOLS.has(name);
}

/**
 * Where a canonical path sits. Computed from the roots, most specific first:
 * `hard-deny` and `protected` win over `workspace`, so `.pi/` inside the
 * workspace is `protected`, and a credential file under a temp dir is `hard-deny`.
 */
export type Zone =
  | 'workspace'
  | 'trusted'
  | 'temp'
  | 'outside'
  | 'hard-deny'
  | 'protected'
  | 'ask-write'
  | 'unresolvable';

export interface Target {
  /** The path as the agent wrote it. */
  raw: string;
  /** Absolute and canonical (realpath of the deepest existing ancestor). */
  path: string;
  access: Access;
  zone: Zone;
  /** The file name matches a secret-file pattern (`.env`, `*.pem`, …). */
  secretFile: boolean;
  /** What the zone's root is, in words: "SSH keys", "git hook", "project". */
  label: string;
  /** The path holds an unexpanded glob (`~/.ss?/*`): no path grant covers it outside the project. */
  glob?: boolean;
}

export type Signal =
  | 'secret-file'
  | 'outside-workspace'
  | 'hard-deny'
  | 'protected-write'
  | 'ask-write'
  | 'shell-dynamic'
  | 'sudo'
  | 'upload'
  | 'destructive'
  | 'placeholder-in-command'
  | 'secret-into-plain-file'
  | 'unresolvable-path'
  /** `xargs` or an archiver takes file names from stdin that the analyzer cannot see. */
  | 'stdin-operands'
  /** `crontab`, `at`, `launchctl load`, `defaults write`: a change that outlasts the session. */
  | 'persistence'
  /** A dev server on a public interface, or a tunnel (`ngrok`, `ssh -R`). */
  | 'network-exposure'
  /** `pbcopy`, `pbpaste`, `xclip`, … */
  | 'clipboard'
  /** A secret file read by a program that may change its text, so redaction cannot match it. */
  | 'secret-transform'
  /** The command expands a variable whose name looks secret, or that the host marked secret. */
  | 'secret-env-expansion';

/** One tool call, classified. */
export interface PermissionRequest {
  toolCallId: string;
  toolName: BuiltinTool;
  kind: RequestKind;
  targets: Target[];
  /** bash only: the command with whitespace collapsed (the grant key). */
  command?: string;
  signals: Signal[];
  /** One specific sentence for each signal ("it uploads data: curl -d @.env sends a file's contents"). */
  signalReasons: Partial<Record<Signal, string>>;
}

export type PermissionVerdict = 'allow' | 'ask' | 'deny';

/** What a grant matches. Never a tool name alone. */
export type GrantMatch =
  | { type: 'path'; access: Access; pathPrefix: string }
  | { type: 'command'; command: string };

export type GrantScope = 'chat' | 'project';

export interface Grant {
  scope: GrantScope;
  match: GrantMatch;
  createdAt: string;
}

/** A scope the user can pick on an ASK, with the exact pattern it would save. */
export interface GrantOption {
  scope: GrantScope;
  /** "Allow in this chat", "Always: reads in ~/work/lib/". */
  label: string;
  /** The human-readable pattern ("~/work/lib/", "pnpm dlx shadcn add button"). */
  pattern: string;
  match: GrantMatch;
}

/**
 * The decision for one call. It is self-contained: an `ask` carries the card
 * to show and the scopes the user may grant, so a host needs nothing else
 * from the engine to put the question in front of a person.
 */
export type PermissionDecision =
  | { decision: 'allow'; reason: string; request: PermissionRequest }
  | { decision: 'deny'; reason: string; request: PermissionRequest }
  | {
      decision: 'ask';
      reason: string;
      request: PermissionRequest;
      prompt: PermissionPrompt;
      /** The scopes the user may grant. Empty when a grant is not allowed. */
      grantOptions: GrantOption[];
    };

/** What a host puts in front of the user for one ASK (`ApprovalRequest.permission` in `@agentic-kit/harness`). */
export interface PermissionPrompt {
  title: string;
  summary: string;
  toolName: string;
  kind: RequestKind;
  command?: string;
  targets: { path: string; access: Access; zone: Zone }[];
  signals: Signal[];
  /** One plain sentence per signal, in order. */
  reasons: string[];
  grantOptions: { scope: GrantScope; label: string; pattern: string }[];
}

/** The filesystem the engine needs. Injected so the pure modules stay testable. */
export interface FsProbe {
  /** Resolve symlinks; reject when the path does not exist. */
  realpath(path: string): Promise<string>;
  /** `true` when an entry exists at the path itself (a dangling link included). */
  lexists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  /** The entries of a directory. */
  readDir(path: string): Promise<DirEntry[]>;
  /** File size in bytes, so large files are skipped before they are read. */
  size(path: string): Promise<number>;
}

export interface DirEntry {
  name: string;
  kind: 'file' | 'dir' | 'symlink' | 'other';
}
