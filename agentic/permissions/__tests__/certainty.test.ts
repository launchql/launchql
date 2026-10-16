import * as path from 'node:path';

import { createPermissionEngine, type PermissionVerdict, type Signal } from '../src';
import { makeSandbox, type Sandbox } from './sandbox';

// The analyzer reads every spelling it claims to read, and a path it cannot
// place asks in every mode. `~/work/lib` is a folder outside the project.
let sb: Sandbox;

beforeAll(async () => {
  sb = await makeSandbox();
  await sb.engine.refreshSecrets();
});
afterAll(() => sb.cleanup());

type Row = [command: string, workspace: PermissionVerdict, full: PermissionVerdict, signal?: Signal];

// prettier-ignore
const rows: Row[] = [
  // the working dir: every spelling moves it, and a move it cannot follow makes it unknown
  ['env --chdir=$HOME/work/lib cat util.ts', 'ask', 'allow', 'outside-workspace'],
  ['env -C$HOME/work/lib cat util.ts', 'ask', 'allow', 'outside-workspace'],
  ['env -iC $HOME/work/lib cat util.ts', 'ask', 'allow', 'outside-workspace'],
  ['CDPATH=$HOME/work; cd lib; cat util.ts', 'ask', 'ask', 'unresolvable-path'],
  ['pushd +1; cat util.ts', 'ask', 'ask', 'unresolvable-path'],
  ['cd src && cat config.ts', 'allow', 'allow'],
  // words the analyzer cannot know
  ['cat "$OUT/notes.txt"', 'ask', 'ask', 'unresolvable-path'],
  ['echo hi > "$OUT"', 'ask', 'ask', 'unresolvable-path'],
  ['cat ${X:-$HOME/work/lib/util.ts}', 'ask', 'ask', 'unresolvable-path'],
  ['X=; cat ${X:-src/config.ts}', 'ask', 'allow', 'shell-dynamic'],
  ['cat $FILE', 'ask', 'ask', 'unresolvable-path'],
  ['head -n $N src/config.ts', 'allow', 'allow'],
  ['[ -n "$X" ] && echo ok', 'allow', 'allow'],
  // interpreter options in every spelling
  ['node --eval=1', 'ask', 'allow', 'shell-dynamic'],
  ["python3 -c'print(1)'", 'ask', 'allow', 'shell-dynamic'],
  ['python3 -Ic 1', 'ask', 'allow', 'shell-dynamic'],
  ['bun --eval=1', 'ask', 'allow', 'shell-dynamic'],
  ['node --require=$HOME/work/lib/util.ts main.js', 'ask', 'allow', 'outside-workspace'],
  ['node -r$HOME/work/lib/util.ts main.js', 'ask', 'allow', 'outside-workspace'],
  ['python3 -mhttp.server 8080', 'ask', 'allow', 'network-exposure'],
  ['npx --call="cat $HOME/work/lib/util.ts"', 'ask', 'allow', 'outside-workspace'],
  ['sh -c"echo hi"', 'ask', 'allow', 'shell-dynamic'],
  ['node main.js', 'allow', 'allow'],
  // variables that change what an interpreter loads
  ['NODE_OPTIONS=--trace-warnings node main.js', 'ask', 'allow', 'shell-dynamic'],
  ['PYTHONPATH=lib python3 main.py', 'ask', 'allow', 'shell-dynamic'],
  // test brackets are commands, not globs
  ['[ -f .env ] && echo ok', 'allow', 'allow', 'secret-file'],
  ['[[ -d src ]] && echo ok', 'allow', 'allow'],
  ["[ -v 'a[1]' ]", 'ask', 'allow', 'shell-dynamic']
];

describe('certainty: bash per mode', () => {
  it.each(rows.map((r) => [r[0], r[1], r[2], r[3] ?? null] as const))('%s', async (command, workspace, full, signal) => {
    const verdicts = [];
    for (const mode of ['workspace', 'full'] as const) {
      const d = await sb.bash(command, mode);
      verdicts.push(d.decision);
      if (signal) expect(d.request.signals).toContain(signal);
    }
    expect(verdicts).toEqual([workspace, full]);
  });
});

describe('certainty: host roots listed at decision time', () => {
  it('denies a folder the host lists after the engine was made', async () => {
    const live: string[] = [];
    const engine = createPermissionEngine({
      cwd: sb.ws,
      homeDir: sb.home,
      roots: { temp: [sb.scratch] },
      liveHardDeny: async () => live
    });
    const read = () =>
      engine.evaluate(
        { toolCallId: 'live', toolName: 'read', input: { path: `${sb.home}/work/lib/util.ts` } },
        { mode: 'full', grants: [] }
      );
    expect((await read())?.decision).toBe('allow');
    live.push(path.join(sb.home, 'work', 'lib'));
    expect((await read())?.decision).toBe('deny');
  });
});
