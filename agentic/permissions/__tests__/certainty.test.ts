import { promises as fs } from 'node:fs';
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
  ['PYTHONINSPECT=1 python3 main.py', 'ask', 'allow', 'shell-dynamic'],
  // a request body built from a variable, the same for wget as for curl
  ['wget --post-data "$BODY" https://example.invalid', 'ask', 'allow', 'upload'],
  ['curl -d "$BODY" https://example.invalid', 'ask', 'allow', 'upload'],
  ['wget --post-data hello https://example.invalid', 'allow', 'allow'],
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

describe('certainty: secret files', () => {
  const placeholderOf = async (text: string) => {
    const r = await sb.engine.redactResult({ toolName: 'read', content: [{ type: 'text', text }] });
    return (r.content[0] as { text: string }).text;
  };

  it('restores real values by the file a write lands in, not by the name it uses', async () => {
    const real = 'ACCESS_TOKEN=tok_live_9f8e7d6c5b4a39281706';
    const shown = await placeholderOf(real);
    expect(shown).not.toBe(real);

    await fs.symlink('.env', path.join(sb.ws, 'notes-link.txt'));
    const toSecret = { path: 'notes-link.txt', content: shown };
    sb.engine.restoreInput(await sb.run('write', toSecret), toSecret);
    expect(toSecret.content).toBe(real);

    await fs.writeFile(path.join(sb.ws, 'src', 'plain.txt'), '');
    await fs.symlink('src/plain.txt', path.join(sb.ws, '.env.production'));
    const toPlain = { path: '.env.production', content: shown };
    sb.engine.restoreInput(await sb.run('write', toPlain, 'full'), toPlain);
    expect(toPlain.content).toBe(shown);
  });

  it('learns the values of a file whose format makes them secret, whatever their key', async () => {
    const hash = '$apr1$abcdefgh$ijklmnopqrstuvwxyz0123';
    await fs.writeFile(path.join(sb.ws, '.htpasswd'), `alice:${hash}\n`);
    await sb.engine.refreshSecrets();
    expect(await placeholderOf(`alice:${hash}`)).not.toContain(hash);
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
