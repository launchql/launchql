import {
  agentBinding,
  assertAgentEvent,
  decodeFrame,
  encodeApprovalDecisionLine,
  encodeFrame,
  Frame,
  isAgentEventLike,
  LineSplitter,
  MAX_LINE_LENGTH,
  OpenFrame,
  parseApprovalDecisionLine,
  relativePathProblem
} from '../src';

describe('machine-protocol codec', () => {
  it('round-trips every frame type', () => {
    const frames: Frame[] = [
      { type: 'open', sessionId: 's1', command: 'echo', args: ['hello'], cols: 80, rows: 24 },
      {
        type: 'open',
        sessionId: 's1',
        command: 'claude',
        runId: 'run-1',
        agentMode: 'cli',
        cliSessionId: 'claude-abc'
      },
      { type: 'open', sessionId: 's1', command: 'agent', runId: 'run-1', agentMode: 'embedded' },
      { type: 'error', sessionId: 's1', message: 'refused', code: 'SESSION_REFUSED' },
      { type: 'input', sessionId: 's1', data: 'ls\n' },
      { type: 'resize', sessionId: 's1', cols: 120, rows: 40 },
      { type: 'signal', sessionId: 's1', signal: 'SIGINT' },
      { type: 'detach', sessionId: 's1' },
      { type: 'reattach', sessionId: 's1', cols: 100, rows: 30 },
      { type: 'reattach', sessionId: 's1' },
      { type: 'close', sessionId: 's1' },
      { type: 'scrollback', sessionId: 's1', data: '\u001b[2J$ ', truncated: true },
      { type: 'detached', sessionId: 's1' },
      {
        type: 'reattached',
        sessionId: 's1',
        state: 'running',
        cols: 100,
        rows: 30,
        lastSeq: '7',
        interactive: true
      },
      { type: 'output', sessionId: 's1', data: 'hello\r\n' },
      {
        type: 'agent_event',
        sessionId: 's1',
        event: { kind: 'session', cliSessionId: 'cli-1' }
      },
      { type: 'agent_event', sessionId: 's1', event: { kind: 'text', text: 'hello' } },
      {
        type: 'agent_event',
        sessionId: 's1',
        event: { kind: 'tool_call', id: 'call-1', name: 'Bash', input: { command: 'pwd' } }
      },
      {
        type: 'agent_event',
        sessionId: 's1',
        event: { kind: 'tool_result', id: 'call-1', output: 'ok', isError: false }
      },
      {
        type: 'agent_event',
        sessionId: 's1',
        event: {
          kind: 'approval_requested',
          requestId: 'request-1',
          tool: 'Bash',
          input: { command: 'pwd' },
          reason: 'needs approval'
        }
      },
      {
        type: 'agent_event',
        sessionId: 's1',
        event: {
          kind: 'approval_resolved',
          requestId: 'request-1',
          decision: 'deny',
          reason: 'denied'
        }
      },
      {
        type: 'agent_event',
        sessionId: 's1',
        event: { kind: 'result', ok: true, summary: 'done', usage: { input: 1 }, costUsd: 0.1 }
      },
      { type: 'output', sessionId: 's1', data: '{"kind":"text","text":"hi"}\n', stream: 'stdout' },
      { type: 'output', sessionId: 's1', data: 'warning: slow\n', stream: 'stderr' },
      {
        type: 'open',
        sessionId: 's1',
        command: 'constructive-agent-host',
        args: ['--harness', 'pi'],
        runId: 'run-1',
        agentMode: 'embedded',
        cwd: 'repo'
      },
      { type: 'exit', sessionId: 's1', exitCode: 0 },
      { type: 'error', sessionId: 's1', message: 'boom' },
      { type: 'error', message: 'runner disconnected' },
      { type: 'attached', machineId: 'm1' }
    ];
    for (const frame of frames) {
      expect(decodeFrame(encodeFrame(frame))).toEqual(frame);
    }
  });

  it('throws on non-JSON input', () => {
    expect(() => decodeFrame('not json')).toThrow(/not JSON/);
  });

  it('throws on non-object frames', () => {
    expect(() => decodeFrame('[1,2]')).toThrow(/not an object/);
    expect(() => decodeFrame('"open"')).toThrow(/not an object/);
  });

  it('throws on unknown frame types', () => {
    expect(() => decodeFrame(JSON.stringify({ type: 'nope' }))).toThrow(/unknown frame type/);
  });

  it('throws on session frames without a sessionId', () => {
    expect(() => decodeFrame(JSON.stringify({ type: 'input', data: 'x' }))).toThrow(
      /missing sessionId/
    );
  });

  it('throws on frames missing required fields', () => {
    expect(() => decodeFrame(JSON.stringify({ type: 'open', sessionId: 's' }))).toThrow(
      /missing command/
    );
    expect(() => decodeFrame(JSON.stringify({ type: 'exit', sessionId: 's' }))).toThrow(
      /missing exitCode/
    );
    expect(() => decodeFrame(JSON.stringify({ type: 'resize', sessionId: 's' }))).toThrow(
      /needs integer cols\/rows/
    );
    expect(() => decodeFrame(JSON.stringify({ type: 'error' }))).toThrow(/missing message/);
    expect(() => decodeFrame(JSON.stringify({ type: 'attached' }))).toThrow(/missing machineId/);
    expect(() => decodeFrame(JSON.stringify({ type: 'scrollback', sessionId: 's' }))).toThrow(
      /missing data\/truncated/
    );
    expect(() =>
      decodeFrame(JSON.stringify({ type: 'reattached', sessionId: 's', state: 'running' }))
    ).toThrow(/missing state\/lastSeq/);
  });

  it('validates agent event frames', () => {
    expect(() =>
      decodeFrame(JSON.stringify({ type: 'agent_event', sessionId: 's' }))
    ).toThrow(/missing event/);
    expect(() =>
      decodeFrame(
        JSON.stringify({ type: 'agent_event', sessionId: 's', event: { kind: 'unknown' } })
      )
    ).toThrow(/unknown event kind/);
    expect(() =>
      decodeFrame(
        JSON.stringify({
          type: 'agent_event',
          sessionId: 's',
          event: { kind: 'tool_call', id: 1, name: 'Bash', input: {} }
        })
      )
    ).toThrow(/missing id/);
    expect(() =>
      decodeFrame(
        JSON.stringify({
          type: 'agent_event',
          sessionId: 's',
          event: { kind: 'approval_resolved', requestId: 'r', decision: 'maybe' }
        })
      )
    ).toThrow(/invalid decision/);
    expect(() =>
      decodeFrame(
        JSON.stringify({
          type: 'agent_event',
          sessionId: 's',
          event: { kind: 'result', ok: 'true' }
        })
      )
    ).toThrow(/missing ok/);
  });

  // An approval decision is not a frame the runner sees: it travels to the
  // program as one line on its stdin, and the program reads it by this codec.
  it('encodes and parses approval decision lines', () => {
    const allow = { kind: 'approval_decision' as const, requestId: 'r', decision: 'allow' as const };
    expect(encodeApprovalDecisionLine(allow)).toBe(`${JSON.stringify(allow)}\n`);
    expect(parseApprovalDecisionLine(JSON.stringify(allow))).toEqual(allow);
    expect(
      parseApprovalDecisionLine(
        JSON.stringify({ kind: 'approval_decision', requestId: 'r', decision: 'deny', reason: 'not now' })
      )
    ).toEqual({ kind: 'approval_decision', requestId: 'r', decision: 'deny', reason: 'not now' });

    // Anything that is not a decision is the program's to read: a prompt, an
    // unrelated JSON line, an empty line.
    expect(parseApprovalDecisionLine('hello')).toBeNull();
    expect(parseApprovalDecisionLine('{"kind":"text"}')).toBeNull();
    expect(parseApprovalDecisionLine('')).toBeNull();

    const decision = { kind: 'approval_decision', requestId: 'r', decision: 'allow' };
    expect(() => parseApprovalDecisionLine(JSON.stringify({ ...decision, requestId: undefined }))).toThrow(
      /missing requestId/
    );
    expect(() => parseApprovalDecisionLine(JSON.stringify({ ...decision, decision: 'maybe' }))).toThrow(
      /invalid decision/
    );
    expect(() => parseApprovalDecisionLine(JSON.stringify({ ...decision, decision: undefined }))).toThrow(
      /invalid decision/
    );
    expect(() => parseApprovalDecisionLine(JSON.stringify({ ...decision, reason: {} }))).toThrow(
      /reason must be a string/
    );
  });

  // A bound program prints events one per line; the relay reading its stdout
  // tells an event line from any other by the same rule the codec applies to
  // an `agent_event` frame, and a line that claims to be one but is not is a
  // protocol fault, not output. The runner itself never reads the line.
  it('tells an agent event line from output and checks its shape', () => {
    expect(isAgentEventLike({ kind: 'text', text: 'hi' })).toBe(true);
    expect(isAgentEventLike({ kind: 'nope' })).toBe(false);
    expect(isAgentEventLike({ type: 'message' })).toBe(false);
    expect(isAgentEventLike('text')).toBe(false);
    expect(assertAgentEvent({ kind: 'result', ok: true }, 'stdout line')).toEqual({ kind: 'result', ok: true });
    expect(() => assertAgentEvent({ kind: 'tool_call', id: 'x' }, 'stdout line')).toThrow(
      /stdout line tool_call event is missing name/
    );
    expect(() => assertAgentEvent(null)).toThrow(/'agent_event' frame is missing event/);
  });

  it('splits lines across chunks and refuses one that never ends', () => {
    const lines = new LineSplitter();
    expect(lines.push('one\r\ntw')).toEqual(['one']);
    expect(lines.push('o\n\nthree')).toEqual(['two', '']);
    expect(lines.flush()).toEqual(['three']);
    expect(lines.flush()).toEqual([]);

    // A line up to the cap is buffered; the byte past it is the fault, and the
    // reader is left empty rather than holding on to what it refused.
    const capped = new LineSplitter(8);
    expect(capped.push('12345678')).toEqual([]);
    expect(() => capped.push('9')).toThrow(/line exceeds 8 characters without a newline/);
    expect(capped.flush()).toEqual([]);
    expect(capped.push('ok\n')).toEqual(['ok']);

    // Complete lines ahead of an oversized tail in one chunk are delivered;
    // the fault is raised by whatever the reader does next.
    const mixed = new LineSplitter(8);
    expect(mixed.push('one\ntwo\n123456789')).toEqual(['one', 'two']);
    expect(() => mixed.push('x\n')).toThrow(/line exceeds 8 characters/);
    expect(mixed.push('x\n')).toEqual(['x']);
    const mixedFlush = new LineSplitter(8);
    expect(mixedFlush.push('one\n123456789')).toEqual(['one']);
    expect(() => mixedFlush.flush()).toThrow(/line exceeds 8 characters/);

    expect(MAX_LINE_LENGTH).toBe(1024 * 1024);
    const wide = new LineSplitter();
    expect(wide.push('x'.repeat(MAX_LINE_LENGTH))).toEqual([]);
    expect(() => wide.push('x')).toThrow(/line exceeds 1048576 characters/);
  });

  it('validates the open frame cwd', () => {
    const open = { type: 'open', sessionId: 's', command: 'constructive-agent-host' };
    expect(() => decodeFrame(JSON.stringify({ ...open, cwd: '' }))).toThrow(/cwd/);
    expect(() => decodeFrame(JSON.stringify({ ...open, cwd: 3 }))).toThrow(/cwd/);
  });

  // Geometry ends up in ioctl(TIOCSWINSZ) on the user's machine, so a client is
  // not trusted to send something a pty would choke on — and it is refused
  // rather than clamped, because a clamped resize is a lie about what the
  // program is being drawn at.
  it('refuses terminal geometry a pty would not accept', () => {
    const bad = [
      { cols: 0, rows: 24 },
      { cols: 80, rows: -1 },
      { cols: 80.5, rows: 24 },
      { cols: 80, rows: 100_000 },
      { cols: '80', rows: '24' }
    ];
    for (const geometry of bad) {
      expect(() =>
        decodeFrame(JSON.stringify({ type: 'resize', sessionId: 's', ...geometry }))
      ).toThrow(/needs integer cols\/rows/);
      expect(() =>
        decodeFrame(JSON.stringify({ type: 'reattach', sessionId: 's', ...geometry }))
      ).toThrow(/needs integer cols\/rows/);
    }
  });

  // The binding is checked the way the tenant's own constraint checks it, so a
  // frame SQL would refuse never gets as far as being asked.
  describe('agent-run binding on open', () => {
    const open = (extra: Record<string, unknown>): OpenFrame =>
      decodeFrame(
        JSON.stringify({ type: 'open', sessionId: 's', command: 'agent', ...extra })
      ) as OpenFrame;

    it('accepts a plain open with no binding at all', () => {
      const frame = open({});
      expect(agentBinding(frame)).toBeNull();
      expect(agentBinding(open({ interactive: true }))).toBeNull();
    });

    it('accepts cli and embedded bindings, with a cli session id only for cli', () => {
      expect(agentBinding(open({ runId: 'r', agentMode: 'cli' }))).toEqual({
        runId: 'r',
        agentMode: 'cli'
      });
      expect(agentBinding(open({ runId: 'r', agentMode: 'cli', cliSessionId: 'c' }))).toEqual({
        runId: 'r',
        agentMode: 'cli',
        cliSessionId: 'c'
      });
      expect(agentBinding(open({ runId: 'r', agentMode: 'embedded' }))).toEqual({
        runId: 'r',
        agentMode: 'embedded'
      });
      expect(agentBinding(open({ runId: 'r', agentMode: 'embedded', interactive: false }))).toEqual(
        { runId: 'r', agentMode: 'embedded' }
      );
    });

    it('refuses agentMode without runId, and runId without agentMode', () => {
      expect(() => open({ agentMode: 'cli' })).toThrow(/both runId and agentMode/);
      expect(() => open({ runId: 'r' })).toThrow(/both runId and agentMode/);
    });

    it('refuses a mode the constraint does not know', () => {
      expect(() => open({ runId: 'r', agentMode: 'tui' })).toThrow(/agentMode must be one of/);
      expect(() => open({ runId: 'r', agentMode: 1 })).toThrow(/agentMode must be one of/);
    });

    it('refuses a cli session id outside cli mode', () => {
      expect(() => open({ runId: 'r', agentMode: 'embedded', cliSessionId: 'c' })).toThrow(
        /cliSessionId requires agentMode 'cli'/
      );
      expect(() => open({ cliSessionId: 'c' })).toThrow(/cliSessionId requires agentMode 'cli'/);
    });

    it('refuses an interactive bound session: bound sessions are headless', () => {
      expect(() => open({ runId: 'r', agentMode: 'cli', interactive: true })).toThrow(
        /bound to a run cannot be interactive/
      );
    });

    it('refuses malformed binding values', () => {
      expect(() => open({ runId: '', agentMode: 'cli' })).toThrow(/runId must be a non-empty/);
      expect(() => open({ runId: 7, agentMode: 'cli' })).toThrow(/runId must be a non-empty/);
      expect(() => open({ runId: 'r', agentMode: 'cli', cliSessionId: '' })).toThrow(
        /cliSessionId must be a non-empty/
      );
    });
  });

  it('refuses a signal it does not know', () => {
    expect(() =>
      decodeFrame(JSON.stringify({ type: 'signal', sessionId: 's', signal: 'SIGSTEAL' }))
    ).toThrow(/unknown signal/);
  });
  it('round-trips the path and file frames', () => {
    const frames: Frame[] = [
      { type: 'path_list', requestId: 'r1', root: 'work', path: 'src' },
      { type: 'path_read', requestId: 'r2', path: 'README.md' },
      {
        type: 'path_listing',
        requestId: 'r1',
        entries: [
          { name: 'a.ts', kind: 'file', size: 3 },
          { name: 'lib', kind: 'directory' },
          { name: 'l', kind: 'symlink' }
        ]
      },
      { type: 'path_content', requestId: 'r2', data: 'aGk=', size: 2 },
      { type: 'fs_list', sessionId: 's', requestId: 'r3', path: '' },
      { type: 'fs_read', sessionId: 's', requestId: 'r4', path: 'a.ts' },
      {
        type: 'fs_listing',
        sessionId: 's',
        requestId: 'r3',
        path: '',
        entries: [{ name: 'a.ts', kind: 'file', size: 3 }]
      },
      { type: 'fs_content', sessionId: 's', requestId: 'r4', path: 'a.ts', data: '', size: 0 },
      { type: 'error', requestId: 'r4', message: 'no', code: 'PATH_INVALID' }
    ];
    for (const frame of frames) expect(decodeFrame(encodeFrame(frame))).toEqual(frame);
  });

  it('throws on malformed path and file frames', () => {
    const bad = [
      { type: 'path_list', path: '' },
      { type: 'path_read', requestId: '', path: '' },
      { type: 'path_read', requestId: 'r', root: 7, path: '' },
      { type: 'path_list', requestId: 'r' },
      { type: 'fs_list', requestId: 'r', path: '' },
      { type: 'fs_read', sessionId: 's', path: 'a' },
      { type: 'path_listing', requestId: 'r', entries: [{ name: 'a', kind: 'socket' }] },
      { type: 'path_listing', requestId: 'r', entries: [{ name: 'a', kind: 'file', size: -1 }] },
      { type: 'fs_listing', sessionId: 's', requestId: 'r', entries: [{ name: 'a', kind: 'file' }] },
      { type: 'path_content', requestId: 'r', data: 'x' },
      { type: 'fs_content', sessionId: 's', requestId: 'r', data: '', size: 0 },
      { type: 'error', requestId: 1, message: 'x' },
      { type: 'error', requestId: 'r', message: 'x', code: 7 },
      { type: 'path_content', requestId: 'r', data: 'aGk=', size: -1 },
      { type: 'path_content', requestId: 'r', data: 'aGk=', size: 3 }
    ];
    for (const frame of bad) expect(() => decodeFrame(JSON.stringify(frame))).toThrow(/machine-protocol/);
  });

  it('says why a path cannot name something under a root', () => {
    for (const ok of ['', '.', 'a', 'src/index.ts', 'a..b', '.hidden/x']) {
      expect(relativePathProblem(ok)).toBeNull();
    }
    expect(relativePathProblem('/etc/passwd')).toMatch(/absolute/);
    expect(relativePathProblem('\\share')).toMatch(/absolute/);
    expect(relativePathProblem('C:/x')).toMatch(/absolute/);
    expect(relativePathProblem('..')).toMatch(/traverses/);
    expect(relativePathProblem('a/../../b')).toMatch(/traverses/);
    expect(relativePathProblem('a\\..\\b')).toMatch(/traverses/);
    expect(relativePathProblem('a\0b')).toMatch(/NUL/);
  });
});
