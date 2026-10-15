import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { configureHost } from '../src/host';
import { describeSchemaTool } from '../src/tools/describe-schema';

const realFetch = globalThis.fetch;
let dir: string;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'db-tools-requests-'));
  writeFileSync(path.join(dir, '.env'), 'ACCESS_TOKEN=project-key\nDATABASE_ID=db-1\n');
  configureHost({
    account: () => ({ userId: 'u1', accessToken: 'account-bearer' }),
    backendConfig: () => ({
      apiEndpoint: 'http://api.example.test/graphql',
      modulesEndpoint: 'http://modules.example.test/graphql',
    }),
  });
});

afterEach(() => {
  globalThis.fetch = realFetch;
  rmSync(dir, { recursive: true, force: true });
});

describe('a tool call', () => {
  it('retries a 503 from the backend and reports it as progress', async () => {
    let probes = 0;
    const fetch = jest.fn(async (_input: RequestInfo | URL, init: RequestInit) => {
      const body = String(init.body);
      if (body.includes('ProbeDatabase')) {
        probes++;
        if (probes === 1) return json(503, {});
        return json(200, { data: { databases: { nodes: [{ id: 'db-1', name: 'myapp', ownerId: 'u1' }] } } });
      }
      if (body.includes('schemas')) {
        return json(200, { data: { schemas: { nodes: [{ id: 'schema-1', name: 'app_public' }] } } });
      }
      return json(200, { data: { tables: { nodes: [] } } });
    });
    globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
    const progress: string[] = [];

    const result = await describeSchemaTool.execute({}, {
      cwd: dir,
      onProgress: (message) => progress.push(message),
    });

    expect(probes).toBe(2);
    expect(progress).toEqual(['Retrying 1/3']);
    expect(result.content[0]).toMatchObject({ type: 'text' });
  });

  it('sends nothing when the call is already cancelled', async () => {
    const fetch = jest.fn();
    globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
    const reason = new Error('cancelled');

    await expect(
      describeSchemaTool.execute({}, { cwd: dir, signal: AbortSignal.abort(reason) }),
    ).rejects.toBe(reason);
    expect(fetch).not.toHaveBeenCalled();
  });
});
