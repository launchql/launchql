// The machine transport wire protocol: JSON text frames over a WebSocket. Two
// socket roles speak it — a runner (the daemon on the user's machine) and a
// client (whatever is driving a session) — with the relay in the middle routing
// frames between them by session id.
//
// The relay never interprets terminal bytes: `input` flows client → runner,
// `output` flows runner → client, both opaque UTF-8 strings. Everything else
// is session lifecycle.
//
// Phase 2 adds the rest of a terminal — `resize`, `signal`, `detach`,
// `reattach` — as frames on this same socket rather than a second transport.
// Each is an *operation*, not a routing hint: the relay answers every one of
// them by asking the tenant's SQL again, so a frame here is a request and never
// a decision. That is what makes a reattach from a different client safe —
// nothing about the attach that opened the session carries over.
//
// Two vocabularies live here, and the line between them is the line between the
// runner and everything above it:
//
// - The *machine* frames (`open` … `exit`, plus enrollment) are the remote
//   control. A runner speaks only these: it runs an allow-listed command in a
//   pty or on pipes, moves bytes, reports the exit. It has no notion of what the
//   command is.
// - The *agent* vocabulary (`AgentBinding` on an `open`, `AgentEvent`, the
//   `agent_event` frame, the stdio contract below) is between a client, the
//   relay and an agent program running *under* the runner. The runner never
//   reads or writes any of it; to the runner an agent program is a command on
//   pipes whose stdout happens to be JSON lines.
//
// This package is vocabulary, never policy. Everything a socket puts on the wire
// — its database, its machine id — is a *coordinate*: it says which row the
// socket is asking about, and the relay answers by asking that database's SQL.
// Nothing here grants anything and no frame carries an authorization decision,
// so naming a coordinate buys nothing: a secret only matches a machine row in
// the tenant that issued it, and RLS decides everything after that. Addressing a
// database you have no credential for is simply a refusal.

// Token hashing is deliberately NOT re-exported here: it needs node's `crypto`,
// and this index is imported by the browser terminal. Node consumers reach it at
// `@constructive-db/machine-protocol/token`.

/**
 * Header a runner identifies itself with at upgrade time.
 *
 * A coordinate, not a claim: the bearer credential is what authenticates, and
 * the machine row it matches is what decides. A socket naming a machine it
 * cannot present the secret for is refused.
 */
export const HEADER_MACHINE_ID = 'x-machine-id';

/**
 * Header naming the tenant database the runner is enrolled in — which database
 * to ask, never permission to be there, exactly as a sync route's hostname
 * chooses a database before anyone is authenticated.
 */
export const HEADER_MACHINE_DATABASE = 'x-machine-database';

/** URL paths the relay serves. */
export const RUNNER_CONNECT_PATH = '/v1/machines/connect';

/**
 * Where a client attaches, with its own credential as a bearer token. The
 * database is in the path because a tenant credential is only meaningful to the
 * tenant that issued it: the relay authenticates the token *there*.
 */
export const clientAttachPath = (databaseId: string, machineId: string) =>
  `/v1/databases/${encodeURIComponent(databaseId)}/machines/${encodeURIComponent(machineId)}/attach`;

/**
 * Subprotocol a browser attaches with.
 *
 * A `WebSocket` in a page cannot set request headers, so the one thing the
 * standard does let it send — the subprotocol list — carries the credential:
 * `[ATTACH_SUBPROTOCOL, '<credential>']`. It is the same bearer token the
 * `Authorization` header would carry, authenticated by the same tenant
 * `authenticate()`, and it stays out of the URL (and therefore out of access
 * logs and `Referer`) which a query parameter would not. The relay answers with
 * {@link ATTACH_SUBPROTOCOL} alone, so the credential is never echoed back.
 */
export const ATTACH_SUBPROTOCOL = 'constructive.machine.v1';

/** The subprotocol list a browser client attaches with. */
export const attachSubprotocols = (credential: string): [string, string] => [
  ATTACH_SUBPROTOCOL,
  credential
];

/**
 * The credential out of a subprotocol list, or null when the list is not an
 * attach list. Only the documented two-entry shape is accepted — anything else
 * is a client that has not agreed this protocol.
 */
export function credentialFromSubprotocols(header: string | undefined): string | null {
  if (!header) return null;
  const values = header.split(',').map(value => value.trim());
  if (values.length !== 2 || values[0] !== ATTACH_SUBPROTOCOL || !values[1]) return null;
  return values[1];
}

/** Parse {@link clientAttachPath}, or null when the path is something else. */
export function parseClientAttachPath(
  path: string
): { databaseId: string; machineId: string } | null {
  const match = /^\/v1\/databases\/([^/]+)\/machines\/([^/]+)\/attach$/.exec(path);
  if (!match) return null;
  return {
    databaseId: decodeURIComponent(match[1]),
    machineId: decodeURIComponent(match[2])
  };
}

/**
 * How a session bound to an agent run executes the agent: `cli` drives the
 * user's own installed CLI, `embedded` runs our loop. Mirrors the
 * `machine_session.agent_mode` check constraint.
 */
export type AgentMode = 'cli' | 'embedded';

export const AGENT_MODES: readonly AgentMode[] = ['cli', 'embedded'];

/**
 * The agent-run binding an `open` frame may carry, client → relay. A bound
 * session is headless: its process is the agent's, driven by the run rather
 * than by a keyboard, so it never gets a pty. Like every coordinate on this
 * wire the run id is a request — the tenant's SQL decides whether the opener
 * may bind to that run. The relay keeps the binding; what reaches the runner
 * is a plain `open` for the agent program, with the binding folded into its
 * arguments.
 */
export interface AgentBinding {
  runId: string;
  agentMode: AgentMode;
  /** The CLI's own resumable session identifier; `cli` mode only. */
  cliSessionId?: string;
}

/** Client → runner: start a process in a new session. */
export interface OpenFrame {
  type: 'open';
  sessionId: string;
  command: string;
  args?: string[];
  cols?: number;
  rows?: number;
  /**
   * Ask for a terminal rather than pipes. An interactive session gets a pty,
   * so its output is opaque terminal bytes (escape sequences and all) and its
   * geometry is part of the session — which is what makes `vim` render and
   * reflow. The default is a command on pipes: stdin in, stdout and stderr out
   * (each `output` frame says which), no echo, no geometry.
   */
  interactive?: boolean;
  /** Agent run this session executes locally. Requires `agentMode`. */
  runId?: string;
  /** How a bound session runs the agent. Requires `runId`. */
  agentMode?: AgentMode;
  /** The CLI's own session identifier; only with `agentMode: 'cli'`. */
  cliSessionId?: string;
  /**
   * Working directory the session runs in, as a request: resolved against the
   * runner's policy root, and refused when it would leave it.
   */
  cwd?: string;
}

/** The binding an `open` frame carries, or null for a plain session. */
export function agentBinding(frame: OpenFrame): AgentBinding | null {
  if (frame.runId === undefined || frame.agentMode === undefined) return null;
  return {
    runId: frame.runId,
    agentMode: frame.agentMode,
    ...(frame.cliSessionId !== undefined ? { cliSessionId: frame.cliSessionId } : {})
  };
}

/** Client → runner: bytes for the session's stdin. */
export interface InputFrame {
  type: 'input';
  sessionId: string;
  data: string;
}

/** Client → runner: the terminal was resized. */
export interface ResizeFrame {
  type: 'resize';
  sessionId: string;
  cols: number;
  rows: number;
}

/** Client → runner: tear the session down. */
export interface CloseFrame {
  type: 'close';
  sessionId: string;
}

/**
 * Signals a client may ask for. `SIGINT` and `SIGQUIT` are the terminal's own
 * interrupt characters, so on a pty they are delivered the way a keyboard
 * delivers them — through the line discipline, to the *foreground* process
 * group — which is what interrupts a running command without ending the
 * session. The rest are delivered to the session leader and do end it.
 */
export const SIGNAL_NAMES = ['SIGINT', 'SIGQUIT', 'SIGTERM', 'SIGHUP', 'SIGKILL'] as const;

export type SignalName = (typeof SIGNAL_NAMES)[number];

/** Client → runner: deliver a signal to the session. */
export interface SignalFrame {
  type: 'signal';
  sessionId: string;
  signal: SignalName;
}

/**
 * Client → relay → runner: stop streaming, but leave the process running.
 *
 * The session stays alive on the machine and its record moves to `detached`,
 * which is what a later {@link ReattachFrame} — from this client or another
 * one — comes back to.
 */
export interface DetachFrame {
  type: 'detach';
  sessionId: string;
}

/**
 * Client → relay → runner: take over a session that is already running.
 *
 * A reattach is a fresh authorization question, never a continuation of the
 * attach that opened the session: the client may be a different one, and the
 * tenant answers again. `cols`/`rows` are the new terminal's geometry, applied
 * to the pty so the program repaints at the size it is being watched on.
 */
export interface ReattachFrame {
  type: 'reattach';
  sessionId: string;
  cols?: number;
  rows?: number;
}

/** Runner → client: bytes from the session's pty. */
export interface OutputFrame {
  type: 'output';
  sessionId: string;
  data: string;
  /**
   * Which pipe the bytes came from, on a non-interactive session. A terminal
   * has one stream, so a pty session's output carries none; a program on
   * pipes has two, and a consumer parsing stdout line by line (an agent's
   * events) must not have stderr spliced into it.
   */
  stream?: 'stdout' | 'stderr';
}

export type AgentEvent =
  | { kind: 'session'; cliSessionId: string }
  | { kind: 'text'; text: string }
  | { kind: 'tool_call'; id: string; name: string; input: unknown }
  | { kind: 'tool_result'; id: string; output: unknown; isError?: boolean }
  | {
      kind: 'approval_requested';
      requestId: string;
      tool: string;
      input: unknown;
      reason?: string;
    }
  | {
      kind: 'approval_resolved';
      requestId: string;
      decision: 'allow' | 'deny';
      reason?: string;
    }
  | { kind: 'result'; ok: boolean; summary?: string; usage?: unknown; costUsd?: number };

export const AGENT_EVENT_KINDS: readonly AgentEvent['kind'][] = [
  'session',
  'text',
  'tool_call',
  'tool_result',
  'approval_requested',
  'approval_resolved',
  'result'
];

export interface AgentEventFrame {
  type: 'agent_event';
  sessionId: string;
  event: AgentEvent;
}

export type ApprovalDecision = 'allow' | 'deny';

// ---------------------------------------------------------------------------
// The agent program contract. An agent runs under the runner as an ordinary
// non-interactive command; this is what it speaks on its pipes, and the relay
// is the peer that reads and writes it — not the runner, which sees bytes.
//
//   stdin  — one prompt per line, and {@link ApprovalDecisionLine}s as JSON
//            lines where the relay answers a question the program asked;
//   stdout — {@link AgentEvent}s as JSON lines; any other line is plain output;
//   stderr — plain output;
//   exit   — the program's own.
//
// `constructive-agent-host` (`@constructive-db/agent-host`) speaks it natively.
// `constructive-agent-cli` (`@constructive-db/agent-cli`) speaks it on behalf
// of a coding-agent CLI (`claude`, `codex`) that does not.
// ---------------------------------------------------------------------------

/**
 * The program the relay runs for a `cli` binding: it wraps the CLI the opener
 * named (`claude`, `codex`) and translates its stream to this contract. The
 * machine's policy must allow it by this exact name.
 */
export const AGENT_CLI_COMMAND = 'constructive-agent-cli';

/**
 * Relay → agent program (a line on its stdin): the answer to an
 * `approval_requested` event the program emitted. Carries no identity: who
 * answered was the run's RLS, asked on the bound run's log.
 */
export interface ApprovalDecisionLine {
  kind: 'approval_decision';
  requestId: string;
  decision: ApprovalDecision;
  reason?: string;
}

export function encodeApprovalDecisionLine(line: ApprovalDecisionLine): string {
  return `${JSON.stringify(line)}\n`;
}

/** The decision a stdin line carries, or null when the line is a prompt. */
export function parseApprovalDecisionLine(line: string): ApprovalDecisionLine | null {
  if (!line.startsWith('{')) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const value = parsed as Record<string, unknown>;
  if (value.kind !== 'approval_decision') return null;
  if (typeof value.requestId !== 'string' || value.requestId.length === 0) {
    throw new Error('machine-protocol: approval_decision line is missing requestId');
  }
  if (value.decision !== 'allow' && value.decision !== 'deny') {
    throw new Error('machine-protocol: approval_decision line has invalid decision');
  }
  const reason = value.reason;
  if (reason !== undefined && typeof reason !== 'string') {
    throw new Error('machine-protocol: approval_decision line reason must be a string');
  }
  const decoded: ApprovalDecisionLine = {
    kind: 'approval_decision',
    requestId: value.requestId,
    decision: value.decision
  };
  if (typeof reason === 'string') decoded.reason = reason;
  return decoded;
}

/** The longest line a {@link LineSplitter} buffers before giving up on it. */
export const MAX_LINE_LENGTH = 1024 * 1024;

/**
 * Split a stream into the complete lines it has delivered so far. Keeps the
 * unterminated tail for the next chunk; `flush` hands it over at the end. A
 * tail that outgrows `maxLineLength` is dropped and reported, so a program
 * that never writes a newline cannot grow the reader without bound.
 */
export class LineSplitter {
  private tail = '';

  constructor(private readonly maxLineLength = MAX_LINE_LENGTH) {}

  /**
   * Complete lines are delivered before an oversized tail in the same chunk is
   * reported: the failure is raised on the next call instead of losing them.
   */
  private overflowed = false;

  push(chunk: string): string[] {
    this.raiseOverflow();
    this.tail += chunk;
    const lines = this.tail.split('\n');
    this.tail = lines.pop() ?? '';
    if (this.tail.length > this.maxLineLength) {
      this.tail = '';
      this.overflowed = true;
      if (lines.length === 0) this.raiseOverflow();
    }
    return lines.map(stripCarriageReturn);
  }

  private raiseOverflow(): void {
    if (!this.overflowed) return;
    this.overflowed = false;
    throw new Error(
      `machine-protocol: line exceeds ${this.maxLineLength} characters without a newline`
    );
  }

  flush(): string[] {
    this.raiseOverflow();
    if (!this.tail) return [];
    const line = stripCarriageReturn(this.tail);
    this.tail = '';
    return [line];
  }
}

function stripCarriageReturn(line: string): string {
  return line.endsWith('\r') ? line.slice(0, -1) : line;
}

/** Runner → client: the process ended. */
export interface ExitFrame {
  type: 'exit';
  sessionId: string;
  exitCode: number;
  signal?: number;
}

/**
 * Any → any: something failed. Carries a session id when the failure belongs
 * to one session (a rejected command), none when it belongs to the connection
 * (the runner dropped).
 */
export interface ErrorFrame {
  type: 'error';
  sessionId?: string;
  /** The `path_*` / `fs_*` request this error answers, when it answers one. */
  requestId?: string;
  message: string;
  /** A stable, machine-readable reason, where the sender has one. */
  code?: string;
}

/**
 * Reading paths under a root, read-only. Two vocabularies, like everything
 * else: the runner leg (`path_list` / `path_read`) names a root relative to the
 * runner's policy cwd and knows nothing about sessions; the client leg
 * (`fs_list` / `fs_read`) names a session, and the relay maps it to that
 * session's working tree after the tenant authorizes it. A request carries a
 * `requestId` and is answered by exactly one frame with the same id: a
 * listing, a content frame, or an `error` with a {@link PathErrorCode}.
 */

/** The most bytes one read returns. A larger file is refused, never truncated. */
export const MAX_READ_BYTES = 1024 * 1024;

/** The most entries one listing returns. A larger directory is refused, never truncated. */
export const MAX_LIST_ENTRIES = 1000;

export const PATH_ERROR_CODES = [
  /** Absolute, traversing (`..`), or carrying a NUL byte. */
  'PATH_INVALID',
  /** Resolves — through a symlink — outside the root. */
  'PATH_OUTSIDE_ROOT',
  'PATH_NOT_FOUND',
  'NOT_A_DIRECTORY',
  'NOT_A_FILE',
  'FILE_TOO_LARGE',
  'DIRECTORY_TOO_LARGE',
  /** Any other filesystem failure; the message carries the cause. */
  'PATH_UNREADABLE'
] as const;

export type PathErrorCode = (typeof PATH_ERROR_CODES)[number];

/**
 * Why `requested` cannot name a path under a root, or `null` when it can.
 * `''` (and `.`) name the root itself. This is syntax only: a path that passes
 * may still resolve outside the root through a symlink, which only the side
 * holding the filesystem can tell.
 */
export function relativePathProblem(requested: string): string | null {
  if (requested.includes('\0')) return 'contains a NUL byte';
  if (requested.startsWith('/') || requested.startsWith('\\') || /^[A-Za-z]:/.test(requested)) {
    return 'is absolute';
  }
  if (requested.split(/[\\/]/).includes('..')) return "traverses out of its root with '..'";
  return null;
}

export type PathEntryKind = 'file' | 'directory' | 'symlink' | 'other';

export interface PathEntry {
  name: string;
  /** What the entry itself is; a symlink is reported as one, not followed. */
  kind: PathEntryKind;
  /** Bytes, for a file. */
  size?: number;
}

const PATH_ENTRY_KINDS: ReadonlySet<string> = new Set(['file', 'directory', 'symlink', 'other']);

/** Relay → runner: list a directory under `root` (relative to the policy cwd). */
export interface PathListFrame {
  type: 'path_list';
  requestId: string;
  /** The root `path` is confined to; omitted means the policy cwd itself. */
  root?: string;
  path: string;
}

/** Relay → runner: read a file under `root` (relative to the policy cwd). */
export interface PathReadFrame {
  type: 'path_read';
  requestId: string;
  root?: string;
  path: string;
}

/** Runner → relay: the entries of a `path_list`, sorted by name. */
export interface PathListingFrame {
  type: 'path_listing';
  requestId: string;
  entries: PathEntry[];
}

/** Runner → relay: a `path_read`'s bytes, base64. */
export interface PathContentFrame {
  type: 'path_content';
  requestId: string;
  data: string;
  size: number;
}

/** Client → relay: list a directory in a session's working tree. */
export interface ListFilesFrame {
  type: 'fs_list';
  sessionId: string;
  requestId: string;
  path: string;
}

/** Client → relay: read a file in a session's working tree. */
export interface ReadFileFrame {
  type: 'fs_read';
  sessionId: string;
  requestId: string;
  path: string;
}

/** Relay → client: the answer to an `fs_list`. */
export interface FileListingFrame {
  type: 'fs_listing';
  sessionId: string;
  requestId: string;
  path: string;
  entries: PathEntry[];
}

/** Relay → client: the answer to an `fs_read`, base64. */
export interface FileContentFrame {
  type: 'fs_content';
  sessionId: string;
  requestId: string;
  path: string;
  data: string;
  size: number;
}

/**
 * Runner → relay: the scrollback a detaching session leaves behind, capped by
 * the runner. The relay records it as the session's one interactive output row
 * (the ledger is the agreed home for terminal bytes) and does not keep it.
 */
export interface ScrollbackFrame {
  type: 'scrollback';
  sessionId: string;
  data: string;
  /** True when older bytes fell out of the runner's ring buffer. */
  truncated: boolean;
}

/** Relay → client: the session is detached and still running. */
export interface DetachedFrame {
  type: 'detached';
  sessionId: string;
}

/**
 * Relay → client: a reattach was authorized, and here is the session as the
 * ledger has it — the geometry it is running at and how much of its record was
 * already written, so a client can read the transcript back from SQL.
 */
export interface ReattachedFrame {
  type: 'reattached';
  sessionId: string;
  state: string;
  cols: number | null;
  rows: number | null;
  /** `machine_session.last_seq`, a bigint, so it travels as a decimal string. */
  lastSeq: string;
  interactive: boolean;
}

/** Relay → client: the attach succeeded and the runner is online. */
export interface AttachedFrame {
  type: 'attached';
  machineId: string;
}

/**
 * Relay → runner: the enrollment token was exchanged.
 *
 * The runner learns two things it did not know: the principal the tenant says it
 * acts as, and a short-lived credential to dial with next time. The credential
 * is held in memory and never logged or written beside the enrollment file —
 * `expiresAt` is when it stops verifying, after which the runner falls back to
 * the enrollment token and is issued a fresh one.
 */
export interface EnrolledFrame {
  type: 'enrolled';
  machineId: string;
  /** The principal the machine's own writes are attributed to. */
  principalId: string;
  /** Short-lived database credential. Never log this value. */
  credential: string;
  /** Epoch seconds at which {@link credential} stops verifying. */
  expiresAt: number;
}

export type ClientToRunnerFrame =
  | OpenFrame
  | InputFrame
  | ResizeFrame
  | SignalFrame
  | DetachFrame
  | ReattachFrame
  | CloseFrame
  | PathListFrame
  | PathReadFrame;
export type RunnerToClientFrame =
  | OutputFrame
  | AgentEventFrame
  | ExitFrame
  | ErrorFrame
  | ScrollbackFrame
  | PathListingFrame
  | PathContentFrame;
export type Frame =
  | ClientToRunnerFrame
  | RunnerToClientFrame
  | ListFilesFrame
  | ReadFileFrame
  | FileListingFrame
  | FileContentFrame
  | AttachedFrame
  | DetachedFrame
  | ReattachedFrame
  | EnrolledFrame;

const FRAME_TYPES: ReadonlySet<string> = new Set([
  'open',
  'input',
  'resize',
  'signal',
  'detach',
  'reattach',
  'close',
  'output',
  'agent_event',
  'exit',
  'error',
  'scrollback',
  'attached',
  'detached',
  'reattached',
  'enrolled',
  'path_list',
  'path_read',
  'path_listing',
  'path_content',
  'fs_list',
  'fs_read',
  'fs_listing',
  'fs_content'
]);

/** Frame types that must carry a session id. */
const SESSION_FRAME_TYPES: ReadonlySet<string> = new Set([
  'open',
  'input',
  'resize',
  'signal',
  'detach',
  'reattach',
  'close',
  'output',
  'agent_event',
  'exit',
  'scrollback',
  'detached',
  'reattached',
  'fs_list',
  'fs_read',
  'fs_listing',
  'fs_content'
]);

/** Frame types that answer, or ask, one request. */
const REQUEST_FRAME_TYPES: ReadonlySet<string> = new Set([
  'path_list',
  'path_read',
  'path_listing',
  'path_content',
  'fs_list',
  'fs_read',
  'fs_listing',
  'fs_content'
]);

function validEntries(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      entry =>
        isPlainObject(entry) &&
        typeof entry.name === 'string' &&
        typeof entry.kind === 'string' &&
        PATH_ENTRY_KINDS.has(entry.kind) &&
        (entry.size === undefined || (Number.isInteger(entry.size) && (entry.size as number) >= 0))
    )
  );
}

const SIGNALS: ReadonlySet<string> = new Set(SIGNAL_NAMES);

/**
 * Terminal geometry a pty will accept. A resize is a client-supplied pair of
 * numbers that ends up in `ioctl(TIOCSWINSZ)`, so it is validated here rather
 * than trusted: zero, negative, fractional or absurd values are a protocol
 * fault, not something to clamp silently.
 */
const MAX_DIMENSION = 1000;

function validDimension(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= MAX_DIMENSION
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Whether `value` looks like an {@link AgentEvent} — an object naming one of
 * the event kinds. Shape is not checked; that is {@link assertAgentEvent}. A
 * headless agent process speaks these on its stdout one per line, and this is
 * how a relaying runner tells an event line from any other line it prints.
 */
export function isAgentEventLike(value: unknown): value is Record<string, unknown> & { kind: AgentEvent['kind'] } {
  return (
    isPlainObject(value) &&
    typeof value.kind === 'string' &&
    (AGENT_EVENT_KINDS as readonly string[]).includes(value.kind)
  );
}

/**
 * `value` as an {@link AgentEvent}, or a thrown protocol error naming what is
 * wrong with it. `where` names the carrier in the message (the frame, a
 * process's stdout) so the fault is attributed.
 */
export function assertAgentEvent(value: unknown, where = "'agent_event' frame"): AgentEvent {
  if (!isPlainObject(value)) {
    throw new Error(`machine-protocol: ${where} is missing event`);
  }
  const event = value;
  const kind = event.kind;
  if (typeof kind !== 'string' || !(AGENT_EVENT_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`machine-protocol: ${where} has unknown event kind '${String(kind)}'`);
  }
  const requiredString = (field: string): void => {
    if (typeof event[field] !== 'string') {
      throw new Error(`machine-protocol: ${where} ${kind} event is missing ${field}`);
    }
  };
  switch (kind) {
  case 'session':
    requiredString('cliSessionId');
    break;
  case 'text':
    requiredString('text');
    break;
  case 'tool_call':
    requiredString('id');
    requiredString('name');
    break;
  case 'tool_result':
    requiredString('id');
    break;
  case 'approval_requested':
    requiredString('requestId');
    requiredString('tool');
    break;
  case 'approval_resolved':
    requiredString('requestId');
    if (event.decision !== 'allow' && event.decision !== 'deny') {
      throw new Error(`machine-protocol: ${where} approval_resolved event has invalid decision`);
    }
    break;
  case 'result':
    if (typeof event.ok !== 'boolean') {
      throw new Error(`machine-protocol: ${where} result event is missing ok`);
    }
    break;
  }
  return event as unknown as AgentEvent;
}

/**
 * The agent-run binding, checked the way `machine_session`'s own constraint
 * checks it, so a frame the tenant would refuse is refused before it is ever
 * asked: `runId` and `agentMode` come together or not at all, `cliSessionId`
 * names a CLI session and so needs `agentMode: 'cli'`, and a bound session is
 * headless — it is the run's process, not a terminal — so `interactive` is a
 * contradiction rather than an option.
 */
function validateAgentBinding(frame: Record<string, unknown>): void {
  const { runId, agentMode, cliSessionId } = frame;
  if (runId !== undefined && (typeof runId !== 'string' || runId.length === 0)) {
    throw new Error("machine-protocol: 'open' frame runId must be a non-empty string");
  }
  if (agentMode !== undefined && !(AGENT_MODES as readonly unknown[]).includes(agentMode)) {
    throw new Error(
      `machine-protocol: 'open' frame agentMode must be one of ${AGENT_MODES.join(', ')}`
    );
  }
  if ((runId === undefined) !== (agentMode === undefined)) {
    throw new Error("machine-protocol: 'open' frame needs both runId and agentMode, or neither");
  }
  if (cliSessionId !== undefined) {
    if (typeof cliSessionId !== 'string' || cliSessionId.length === 0) {
      throw new Error("machine-protocol: 'open' frame cliSessionId must be a non-empty string");
    }
    if (agentMode !== 'cli') {
      throw new Error("machine-protocol: 'open' frame cliSessionId requires agentMode 'cli'");
    }
  }
  if (runId !== undefined && frame.interactive === true) {
    throw new Error("machine-protocol: 'open' frame bound to a run cannot be interactive");
  }
  if (frame.cwd !== undefined && (typeof frame.cwd !== 'string' || frame.cwd.length === 0)) {
    throw new Error("machine-protocol: 'open' frame cwd must be a non-empty string");
  }
}

export function encodeFrame(frame: Frame): string {
  return JSON.stringify(frame);
}

/**
 * Parse one wire message into a frame. Malformed input is a protocol fault on
 * the sending socket, so this throws rather than returning a placeholder —
 * the caller decides whether that closes the connection.
 */
export function decodeFrame(raw: string): Frame {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `machine-protocol: frame is not JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('machine-protocol: frame is not an object');
  }
  const frame = parsed as Record<string, unknown>;
  const type = frame.type;
  if (typeof type !== 'string' || !FRAME_TYPES.has(type)) {
    throw new Error(`machine-protocol: unknown frame type '${String(type)}'`);
  }
  if (SESSION_FRAME_TYPES.has(type) && typeof frame.sessionId !== 'string') {
    throw new Error(`machine-protocol: '${type}' frame is missing sessionId`);
  }
  if (
    REQUEST_FRAME_TYPES.has(type) &&
    (typeof frame.requestId !== 'string' || frame.requestId.length === 0)
  ) {
    throw new Error(`machine-protocol: '${type}' frame is missing requestId`);
  }
  switch (type) {
  case 'open':
    if (typeof frame.command !== 'string' || frame.command.length === 0) {
      throw new Error("machine-protocol: 'open' frame is missing command");
    }
    if (frame.cols !== undefined || frame.rows !== undefined) {
      if (!validDimension(frame.cols) || !validDimension(frame.rows)) {
        throw new Error(
          `machine-protocol: 'open' frame needs integer cols/rows in 1..${MAX_DIMENSION}`
        );
      }
    }
    validateAgentBinding(frame);
    break;
  case 'input':
  case 'output':
    if (typeof frame.data !== 'string') {
      throw new Error(`machine-protocol: '${type}' frame is missing data`);
    }
    if (
      type === 'output' &&
      frame.stream !== undefined &&
      frame.stream !== 'stdout' &&
      frame.stream !== 'stderr'
    ) {
      throw new Error("machine-protocol: 'output' frame stream must be 'stdout' or 'stderr'");
    }
    break;
  case 'agent_event':
    assertAgentEvent(frame.event);
    break;
  case 'resize':
    if (!validDimension(frame.cols) || !validDimension(frame.rows)) {
      throw new Error(
        `machine-protocol: 'resize' frame needs integer cols/rows in 1..${MAX_DIMENSION}`
      );
    }
    break;
  case 'reattach':
    // Geometry is optional on a reattach (a client may want the size the
    // session already has), but a supplied one is held to the same bounds.
    if (frame.cols !== undefined || frame.rows !== undefined) {
      if (!validDimension(frame.cols) || !validDimension(frame.rows)) {
        throw new Error(
          `machine-protocol: 'reattach' frame needs integer cols/rows in 1..${MAX_DIMENSION}`
        );
      }
    }
    break;
  case 'signal':
    if (typeof frame.signal !== 'string' || !SIGNALS.has(frame.signal)) {
      throw new Error(
        `machine-protocol: 'signal' frame has unknown signal '${String(frame.signal)}'`
      );
    }
    break;
  case 'scrollback':
    if (typeof frame.data !== 'string' || typeof frame.truncated !== 'boolean') {
      throw new Error("machine-protocol: 'scrollback' frame is missing data/truncated");
    }
    break;
  case 'reattached':
    if (typeof frame.state !== 'string' || typeof frame.lastSeq !== 'string') {
      throw new Error("machine-protocol: 'reattached' frame is missing state/lastSeq");
    }
    break;
  case 'exit':
    if (typeof frame.exitCode !== 'number') {
      throw new Error("machine-protocol: 'exit' frame is missing exitCode");
    }
    break;
  case 'error':
    if (typeof frame.message !== 'string') {
      throw new Error("machine-protocol: 'error' frame is missing message");
    }
    if (frame.requestId !== undefined && typeof frame.requestId !== 'string') {
      throw new Error("machine-protocol: 'error' frame requestId must be a string");
    }
    break;
  case 'path_list':
  case 'path_read':
    if (frame.root !== undefined && typeof frame.root !== 'string') {
      throw new Error(`machine-protocol: '${type}' frame root must be a string`);
    }
    if (typeof frame.path !== 'string') {
      throw new Error(`machine-protocol: '${type}' frame is missing path`);
    }
    break;
  case 'fs_list':
  case 'fs_read':
    if (typeof frame.path !== 'string') {
      throw new Error(`machine-protocol: '${type}' frame is missing path`);
    }
    break;
  case 'path_listing':
  case 'fs_listing':
    if (!validEntries(frame.entries)) {
      throw new Error(`machine-protocol: '${type}' frame has malformed entries`);
    }
    if (type === 'fs_listing' && typeof frame.path !== 'string') {
      throw new Error("machine-protocol: 'fs_listing' frame is missing path");
    }
    break;
  case 'path_content':
  case 'fs_content':
    if (typeof frame.data !== 'string' || !Number.isInteger(frame.size)) {
      throw new Error(`machine-protocol: '${type}' frame is missing data/size`);
    }
    if (type === 'fs_content' && typeof frame.path !== 'string') {
      throw new Error("machine-protocol: 'fs_content' frame is missing path");
    }
    break;
  case 'attached':
    if (typeof frame.machineId !== 'string') {
      throw new Error("machine-protocol: 'attached' frame is missing machineId");
    }
    break;
  case 'enrolled':
    if (typeof frame.machineId !== 'string' || typeof frame.principalId !== 'string') {
      throw new Error("machine-protocol: 'enrolled' frame is missing machineId/principalId");
    }
    if (typeof frame.credential !== 'string' || typeof frame.expiresAt !== 'number') {
      throw new Error("machine-protocol: 'enrolled' frame is missing credential/expiresAt");
    }
    break;
  }
  return frame as unknown as Frame;
}
