// One outbound connection per enrollment. The runner dials the relay, keeps
// the socket alive with a reconnect loop, and serves sessions: an `open`
// frame spawns a process (after the local policy says yes), `input`/`resize`/
// `signal` drive it, and its output and exit stream back as frames. Nothing
// here ever listens on a port.
//
// The runner is a remote control and nothing more. It runs the command it is
// handed — in a pty when the session is a terminal, on pipes when it is a
// command — moves the bytes, and reports the exit. It does not know what the
// command is. A coding agent, an agent host, a build: each is an allow-listed
// program on pipes whose stdout the runner forwards without reading. Whatever
// vocabulary such a program speaks is between it and the relay's clients;
// none of it is here, and none of it may be added here.
//
// A pty outlives the socket that asked for it. An interactive session is a
// terminal on this machine, not a state of the connection, so `detach` (and a
// dropped relay) stop the *streaming* and leave the process running; the bytes
// it writes while nobody is watching go into a capped ring buffer, and a later
// `reattach` — from whichever client the tenant then authorizes — replays that
// ring so the program repaints. The runner is the only place those bytes are
// held in memory, and it holds a bounded window of them, never a transcript.

import {
  decodeFrame,
  encodeFrame,
  Frame,
  HEADER_MACHINE_DATABASE,
  HEADER_MACHINE_ID,
  MAX_PATH_REQUESTS_IN_FLIGHT,
  OpenFrame,
  PathListFrame,
  PathReadFrame,
  RUNNER_CONNECT_PATH,
  SignalName
} from '@constructive-db/machine-protocol';
import { Logger } from '@pgpmjs/logger';
import { WebSocket } from 'ws';

import { Enrollment } from './config';
import { listPath, PathAccessError, readPath } from './files';
import { PolicyViolationError, resolveSpawn, RunnerPolicy } from './policy';
import { pipeProcess, ptyProcess, SessionProcess } from './process';

/** Stop presenting a credential this long before it expires. */
const CREDENTIAL_SKEW_MS = 30_000;

/**
 * How much recent output an unwatched session keeps, in characters. Bounded on
 * purpose: it is a repaint buffer, not a recording, and the oldest bytes are
 * dropped rather than growing a detached session without limit.
 */
const SCROLLBACK_LIMIT = 64 * 1024;

/**
 * Signals delivered as the terminal's own control characters instead of to a
 * pid. `kill(SIGINT)` would signal the session leader — the shell — which
 * either ignores it or dies; writing the interrupt character lets the pty's
 * line discipline deliver it to the *foreground* process group, which is how a
 * keyboard `^C` stops the running command and leaves the shell prompt behind.
 */
const CONTROL_CHARACTERS: Partial<Record<SignalName, string>> = {
  SIGINT: '\x03',
  SIGQUIT: '\x1c'
};

interface RunnerSession {
  proc: SessionProcess;
  /** A terminal the tenant may detach from and come back to. */
  interactive: boolean;
  cols: number;
  rows: number;
  /** False while nobody is attached: output is buffered, not sent. */
  streaming: boolean;
  /** Recent output, for the repaint a reattach needs. Capped. */
  scrollback: string;
  /** True once the cap dropped older bytes. */
  truncated: boolean;
}

export interface EnrollmentRunnerOptions {
  enrollment: Enrollment;
  policy: RunnerPolicy;
  logger: Logger;
  /** First reconnect delay in ms; doubles up to `reconnectMaxMs`. */
  reconnectInitialMs?: number;
  reconnectMaxMs?: number;
}

/** The connection for one enrollment: dial, serve sessions, redial on drop. */
export class EnrollmentRunner {
  private readonly enrollment: Enrollment;
  private readonly policy: RunnerPolicy;
  private readonly logger: Logger;
  private readonly reconnectInitialMs: number;
  private readonly reconnectMaxMs: number;

  private ws: WebSocket | null = null;
  private readonly sessions = new Map<string, RunnerSession>();
  private pathRequestsInFlight = 0;
  /**
   * The short-lived credential the relay minted for the last dial, held in
   * memory only: it is never logged and never written beside the enrollment
   * file, and it is dropped once it can no longer verify so the next dial falls
   * back to the enrollment token and is issued a fresh one.
   */
  private credential: { value: string; expiresAt: number } | null = null;
  private reconnectDelayMs: number;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private stopped = false;

  constructor(options: EnrollmentRunnerOptions) {
    this.enrollment = options.enrollment;
    this.policy = options.policy;
    this.logger = options.logger;
    this.reconnectInitialMs = options.reconnectInitialMs ?? 250;
    this.reconnectMaxMs = options.reconnectMaxMs ?? 10_000;
    this.reconnectDelayMs = this.reconnectInitialMs;
  }

  start(): void {
    this.stopped = false;
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // Stopping the daemon is the one case where a live terminal does not
    // survive: the process tree it belongs to is going away with it.
    for (const [sessionId, session] of this.sessions) {
      session.proc.kill();
      this.sessions.delete(sessionId);
    }
    this.ws?.terminate();
    this.ws = null;
  }

  get connected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /** Sessions this runner still holds, for tests and a future status frame. */
  get liveSessions(): string[] {
    return [...this.sessions.keys()];
  }

  /**
   * What to present on this dial: the credential from the last exchange while it
   * still verifies, else the enrollment token. The enrollment token buys an
   * exchange; it is not the standing credential.
   */
  private secret(): string {
    const held = this.credential;
    if (held && held.expiresAt * 1000 > Date.now() + CREDENTIAL_SKEW_MS) return held.value;
    this.credential = null;
    return this.enrollment.token;
  }

  /**
   * Send on whichever socket is current. A session outlives the socket it was
   * opened on, so its output must never be pinned to a closed one.
   */
  private send(frame: Frame): void {
    const ws = this.ws;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(encodeFrame(frame));
  }

  private connect(): void {
    const { relayUrl, machineId, database } = this.enrollment;
    const url = new URL(RUNNER_CONNECT_PATH, relayUrl);
    const ws = new WebSocket(url, {
      headers: {
        authorization: `Bearer ${this.secret()}`,
        [HEADER_MACHINE_ID]: machineId,
        [HEADER_MACHINE_DATABASE]: database
      }
    });
    this.ws = ws;

    ws.on('open', () => {
      this.reconnectDelayMs = this.reconnectInitialMs;
      this.logger.info(`machine-runner: '${machineId}' connected to ${relayUrl}`);
    });

    ws.on('message', raw => {
      let frame: Frame;
      try {
        frame = decodeFrame(raw.toString());
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`machine-runner: bad frame from relay: ${message}`);
        ws.close(4002, 'protocol error');
        return;
      }
      this.handleFrame(ws, frame);
    });

    // 'close' always follows an errored socket, so the reconnect is scheduled
    // there; here the failure only needs to be visible.
    ws.on('error', err => {
      this.logger.warn(`machine-runner: '${machineId}' socket error: ${err.message}`);
    });

    ws.on('close', () => {
      if (this.ws !== ws) return;
      this.ws = null;
      // A dropped relay is a detach the tenant never asked for: an interactive
      // terminal keeps running and buffers, so a reattach after the relay comes
      // back finds it alive. A command-mode session has no one to stream to and
      // nothing to come back for, so it ends with its connection.
      for (const [sessionId, session] of this.sessions) {
        session.streaming = false;
        if (session.interactive) continue;
        session.proc.kill();
        this.sessions.delete(sessionId);
      }
      if (this.stopped) return;
      this.logger.warn(
        `machine-runner: '${machineId}' disconnected, reconnecting in ${this.reconnectDelayMs}ms`
      );
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, this.reconnectDelayMs);
      this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, this.reconnectMaxMs);
    });
  }

  private handleFrame(ws: WebSocket, frame: Frame): void {
    switch (frame.type) {
    case 'open':
      this.openSession(ws, frame);
      return;
    case 'input': {
      const session = this.require(ws, frame.sessionId);
      if (!session) return;
      session.proc.write(frame.data);
      return;
    }
    case 'resize': {
      const session = this.require(ws, frame.sessionId);
      if (!session) return;
      if (!session.proc.resize) {
        ws.send(
          encodeFrame({
            type: 'error',
            sessionId: frame.sessionId,
            message: 'command session has no terminal to resize'
          })
        );
        return;
      }
      session.cols = frame.cols;
      session.rows = frame.rows;
      session.proc.resize(frame.cols, frame.rows);
      return;
    }
    case 'signal': {
      const session = this.require(ws, frame.sessionId);
      if (!session) return;
      this.deliverSignal(session, frame.sessionId, frame.signal);
      return;
    }
    case 'detach': {
      const session = this.require(ws, frame.sessionId);
      if (!session) return;
      // The terminal keeps running; what stops is the streaming. The window it
      // buffered goes back once, for the ledger to record, and is then dropped
      // from this side of the wire.
      session.streaming = false;
      ws.send(
        encodeFrame({
          type: 'scrollback',
          sessionId: frame.sessionId,
          data: session.scrollback,
          truncated: session.truncated
        })
      );
      return;
    }
    case 'reattach': {
      const session = this.require(ws, frame.sessionId);
      if (!session) return;
      session.streaming = true;
      if (frame.cols !== undefined && frame.rows !== undefined && session.proc.resize) {
        session.cols = frame.cols;
        session.rows = frame.rows;
        session.proc.resize(frame.cols, frame.rows);
      }
      // Repaint: what the terminal looked like to whoever left it. A full-screen
      // program redraws on the resize above, so this is what makes a scrolling
      // session (a shell's history) come back too.
      if (session.scrollback.length > 0) {
        ws.send(
          encodeFrame({ type: 'output', sessionId: frame.sessionId, data: session.scrollback })
        );
      }
      return;
    }
    case 'close': {
      const session = this.sessions.get(frame.sessionId);
      if (session) {
        session.proc.kill();
        this.sessions.delete(frame.sessionId);
      }
      return;
    }
    case 'path_list':
    case 'path_read':
      if (this.pathRequestsInFlight >= MAX_PATH_REQUESTS_IN_FLIGHT) {
        ws.send(
          encodeFrame({
            type: 'error',
            requestId: frame.requestId,
            code: 'TOO_MANY_PATH_REQUESTS',
            message: `${MAX_PATH_REQUESTS_IN_FLIGHT} path requests are already being answered`
          })
        );
        return;
      }
      this.pathRequestsInFlight += 1;
      void this.answerPath(ws, frame).finally(() => {
        this.pathRequestsInFlight -= 1;
      });
      return;
    case 'enrolled':
      // The exchange's result: the tenant resolved this machine to a principal
      // and minted a credential to dial with next time. Its value never reaches
      // the log — only that it exists, and for how long.
      this.credential = { value: frame.credential, expiresAt: frame.expiresAt };
      this.logger.info(
        `machine-runner: '${frame.machineId}' enrolled as principal ${frame.principalId}; ` +
          `credential valid for ${Math.max(0, frame.expiresAt - Math.floor(Date.now() / 1000))}s`
      );
      return;
    default:
      this.logger.error(`machine-runner: unexpected '${frame.type}' frame from relay`);
      ws.close(4002, 'protocol error');
    }
  }

  /**
   * Answer a read-only path request on the socket it arrived on: a listing, a
   * file's bytes, or an `error` carrying the request id and why. A refusal
   * is the requester's to act on; any other failure is also logged here.
   */
  private async answerPath(ws: WebSocket, frame: PathListFrame | PathReadFrame): Promise<void> {
    const { requestId } = frame;
    let reply: Frame;
    try {
      reply =
        frame.type === 'path_list'
          ? {
            type: 'path_listing',
            requestId,
            entries: await listPath(this.policy, frame.root, frame.path)
          }
          : { type: 'path_content', requestId, ...(await readPath(this.policy, frame.root, frame.path)) };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!(err instanceof PathAccessError)) {
        this.logger.error(`machine-runner: ${frame.type} '${frame.path}' failed: ${message}`);
      }
      reply = {
        type: 'error',
        requestId,
        message,
        code: err instanceof PathAccessError ? err.code : 'PATH_UNREADABLE'
      };
    }
    if (ws.readyState === WebSocket.OPEN) ws.send(encodeFrame(reply));
  }

  /** The session a frame addresses, or an `error` frame back and undefined. */
  private require(ws: WebSocket, sessionId: string): RunnerSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      ws.send(encodeFrame({ type: 'error', sessionId, message: 'unknown session' }));
      return undefined;
    }
    return session;
  }

  /**
   * Deliver a signal the way a terminal would. The two signals a keyboard
   * produces go through the line discipline so they reach the foreground
   * process group; the rest go to the session leader and therefore end the
   * session, which is what asking for them means.
   */
  private deliverSignal(session: RunnerSession, sessionId: string, signal: SignalName): void {
    const character = CONTROL_CHARACTERS[signal];
    if (character && session.proc.resize) {
      session.proc.write(character);
      return;
    }
    try {
      session.proc.kill(signal);
    } catch (err) {
      // node-pty throws when the process is already gone, which is a race the
      // requester should see rather than a failure of the runner.
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`machine-runner: ${signal} to session '${sessionId}' failed: ${message}`);
      this.send({ type: 'error', sessionId, message: `${signal} failed: ${message}` });
    }
  }

  private openSession(ws: WebSocket, frame: OpenFrame): void {
    const { sessionId, command } = frame;
    const args = frame.args ?? [];
    const interactive = frame.interactive === true;
    if (this.sessions.has(sessionId)) {
      ws.send(encodeFrame({ type: 'error', sessionId, message: 'session id already in use' }));
      return;
    }
    const cols = frame.cols ?? 80;
    const rows = frame.rows ?? 24;
    let proc: SessionProcess;
    try {
      const spec = resolveSpawn(this.policy, command, args, frame.cwd);
      proc = interactive ? ptyProcess(spec, cols, rows) : pipeProcess(spec);
    } catch (err) {
      // A rejected command is the policy answering "no": the requester learns
      // why, the machine's log records it, and the connection stays up.
      const message = err instanceof Error ? err.message : String(err);
      if (!(err instanceof PolicyViolationError)) {
        this.logger.error(`machine-runner: spawn '${command}' failed: ${message}`);
      } else {
        this.logger.warn(`machine-runner: refused '${command}': ${message}`);
      }
      ws.send(encodeFrame({ type: 'error', sessionId, message }));
      return;
    }
    const session: RunnerSession = {
      proc,
      interactive,
      cols,
      rows,
      streaming: true,
      scrollback: '',
      truncated: false
    };
    this.sessions.set(sessionId, session);
    proc.onData((data, stream) => {
      // Buffered for an interactive session whether or not anyone is watching:
      // that buffer is the repaint a reattach needs. Command mode streams and
      // keeps nothing — its transcript is the ledger.
      if (session.interactive) this.remember(session, data);
      if (session.streaming) {
        this.send({ type: 'output', sessionId, data, ...(stream ? { stream } : {}) });
      }
    });
    proc.onExit(({ exitCode, signal }) => {
      this.sessions.delete(sessionId);
      if (session.streaming) this.send({ type: 'exit', sessionId, exitCode, signal });
    });
    // The exit that follows — the process's own, or the one a failed start
    // reports — is what ends the session.
    proc.onError(err => {
      this.logger.error(`machine-runner: session '${sessionId}' process failed: ${err.message}`);
      this.send({ type: 'error', sessionId, message: `process failed: ${err.message}` });
      proc.kill('SIGTERM');
    });
  }

  /** Append to the capped ring, dropping the oldest bytes past the limit. */
  private remember(session: RunnerSession, data: string): void {
    const combined = session.scrollback + data;
    if (combined.length <= SCROLLBACK_LIMIT) {
      session.scrollback = combined;
      return;
    }
    session.scrollback = combined.slice(combined.length - SCROLLBACK_LIMIT);
    session.truncated = true;
  }
}

export interface MachineRunnerOptions {
  enrollments: Enrollment[];
  policy: RunnerPolicy;
  logger: Logger;
  reconnectInitialMs?: number;
  reconnectMaxMs?: number;
}

/** The daemon: one EnrollmentRunner per enrollment in the config. */
export class MachineRunner {
  readonly runners: EnrollmentRunner[];

  constructor(options: MachineRunnerOptions) {
    if (options.enrollments.length === 0) {
      throw new Error('machine-runner: at least one enrollment is required');
    }
    this.runners = options.enrollments.map(
      enrollment =>
        new EnrollmentRunner({
          enrollment,
          policy: options.policy,
          logger: options.logger,
          reconnectInitialMs: options.reconnectInitialMs,
          reconnectMaxMs: options.reconnectMaxMs
        })
    );
  }

  start(): void {
    for (const runner of this.runners) runner.start();
  }

  stop(): void {
    for (const runner of this.runners) runner.stop();
  }
}
