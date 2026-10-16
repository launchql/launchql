import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  createPermissionEngine,
  type Grant,
  type PermissionDecision,
  type PermissionEngine,
  type PermissionMode
} from '../src';

export const ENV_FILE = [
  'ACCESS_TOKEN=tok_live_9f8e7d6c5b4a39281706',
  'DATABASE_ID=8f3a9c2e-1111-2222-3333-444455556666',
  'OWNER_ID=0b1c2d3e-aaaa-bbbb-cccc-ddddeeeeffff',
  'API_KEY=short',
  'DATABASE_URL=postgres://app:Sup3rS3cretPw@localhost:5432/app',
  'NEXT_PUBLIC_URL=http://localhost:3000',
  ''
].join('\n');

export type AskDecision = Extract<PermissionDecision, { decision: 'ask' }>;

/** The decision, which must be an ask (fails the test otherwise). */
export function asAsk(d: PermissionDecision): AskDecision {
  expect(d.decision).toBe('ask');
  return d as AskDecision;
}

export interface Sandbox {
  root: string;
  home: string;
  ws: string;
  scratch: string;
  engine: PermissionEngine;
  /** Evaluate one built-in call. */
  run(toolName: string, input: Record<string, unknown>, mode?: PermissionMode, grants?: Grant[]): Promise<PermissionDecision>;
  bash(command: string, mode?: PermissionMode, grants?: Grant[]): Promise<PermissionDecision>;
  cleanup(): Promise<void>;
}

let counter = 0;

/**
 * A fake home with credential dirs, a project at `~/work/app` with a `.env`,
 * a sibling folder `~/work/lib`, and a scratch dir as the only temp root.
 */
export async function makeSandbox(): Promise<Sandbox> {
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-perm-')));
  const home = path.join(root, 'home');
  const ws = path.join(home, 'work', 'app');
  const scratch = path.join(root, 'scratch');
  for (const dir of [
    path.join(home, '.ssh'),
    path.join(home, '.aws'),
    path.join(home, 'work', 'lib'),
    path.join(ws, 'src'),
    path.join(ws, '.git', 'hooks'),
    path.join(ws, 'node_modules'),
    scratch
  ]) {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(path.join(home, '.ssh', 'id_ed25519'), 'PRIVATE');
  await fs.writeFile(path.join(home, '.aws', 'credentials'), '[default]\n');
  await fs.writeFile(path.join(home, 'work', 'lib', 'util.ts'), 'export {};\n');
  await fs.writeFile(path.join(ws, '.env'), ENV_FILE);
  await fs.writeFile(path.join(ws, 'src', 'config.ts'), 'export const config = {};\n');

  const engine = createPermissionEngine({
    cwd: ws,
    homeDir: home,
    roots: { temp: [scratch] },
    placeholderKey: 'test-key'
  });
  const run = (toolName: string, input: Record<string, unknown>, mode: PermissionMode = 'workspace', grants: Grant[] = []) =>
    engine.evaluate({ toolCallId: `call-${++counter}`, toolName, input }, { mode, grants });
  return {
    root,
    home,
    ws,
    scratch,
    engine,
    run,
    bash: (command, mode, grants) => run('bash', { command }, mode, grants),
    cleanup: () => fs.rm(root, { recursive: true, force: true })
  };
}
