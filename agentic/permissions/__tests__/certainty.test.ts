import * as path from 'node:path';

import { createPermissionEngine } from '../src';
import { makeSandbox, type Sandbox } from './sandbox';

let sb: Sandbox;

beforeAll(async () => {
  sb = await makeSandbox();
  await sb.engine.refreshSecrets();
});
afterAll(() => sb.cleanup());

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
