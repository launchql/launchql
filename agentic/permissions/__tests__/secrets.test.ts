import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import { asAsk, ENV_FILE, makeSandbox, type Sandbox } from './sandbox';

let sb: Sandbox;
let n = 0;

// A fake Stripe-shaped key, built at runtime so the source holds no key-shaped literal.
const STRIPE_KEY = ['sk', 'test', 'abcdefghijklmnopqrstuvwx'].join('_');

beforeAll(async () => {
  sb = await makeSandbox();
  await fs.mkdir(path.join(sb.ws, 'apps', 'api'), { recursive: true });
  await fs.writeFile(path.join(sb.ws, 'apps', 'api', '.env.local'), `STRIPE_SECRET=${STRIPE_KEY}\n`);
  await fs.writeFile(path.join(sb.ws, '.env.example'), 'EXAMPLE_TOKEN=not-a-real-token-value\n');
  await fs.mkdir(path.join(sb.ws, 'node_modules', 'pkg'), { recursive: true });
  await fs.writeFile(path.join(sb.ws, 'node_modules', 'pkg', '.env'), 'VENDOR_TOKEN=vendor-token-value-123\n');
  await sb.engine.refreshSecrets();
});
afterAll(() => sb.cleanup());

const text = (s: string) => [{ type: 'text', text: s }];
const redact = (s: string, details?: unknown) => sb.engine.redactResult({ toolName: 'read', content: text(s), details });
const out = (r: { content: unknown[] }) => (r.content[0] as { text: string }).text;

describe('secret vault', () => {
  it('redacts the .env values in a read and keeps IDs and short values', async () => {
    const r = await redact(ENV_FILE);
    const shown = out(r);
    expect(r.changed).toBe(true);
    expect(shown).not.toContain('tok_live_9f8e7d6c5b4a39281706');
    expect(shown).not.toContain('Sup3rS3cretPw');
    expect(shown).toMatch(/^ACCESS_TOKEN=«secret:ACCESS_TOKEN#[0-9a-f]{4}»$/m);
    expect(shown).toMatch(/^DATABASE_URL=«secret:DATABASE_URL#[0-9a-f]{4}»$/m);
    expect(shown).toContain('DATABASE_ID=8f3a9c2e-1111-2222-3333-444455556666');
    expect(shown).toContain('OWNER_ID=0b1c2d3e-aaaa-bbbb-cccc-ddddeeeeffff');
    expect(shown).toContain('API_KEY=short');
    expect(shown).toContain('NEXT_PUBLIC_URL=http://localhost:3000');
  });

  it('redacts grep output, nested .env files, and a password seen alone', async () => {
    const shown = out(await redact(`apps/api/.env.local:1:STRIPE_SECRET=${STRIPE_KEY}\npw is Sup3rS3cretPw`));
    expect(shown).toMatch(/STRIPE_SECRET=«secret:STRIPE_SECRET#[0-9a-f]{4}»/);
    expect(shown).toMatch(/pw is «secret:DATABASE_URL#[0-9a-f]{4}»/);
  });

  it('skips templates and node_modules', async () => {
    expect(out(await redact('not-a-real-token-value vendor-token-value-123'))).toBe('not-a-real-token-value vendor-token-value-123');
  });

  it('replaces the longest value first', async () => {
    sb.engine.addSecret('SHORT_KEY', 'abcdefgh1234');
    sb.engine.addSecret('LONG_KEY', 'abcdefgh1234XYZW5678');
    const shown = out(await redact('a=abcdefgh1234XYZW5678 b=abcdefgh1234'));
    expect(shown).toMatch(/^a=«secret:LONG_KEY#[0-9a-f]{4}» b=«secret:SHORT_KEY#[0-9a-f]{4}»$/);
  });

  it('redacts unnamed token shapes, details strings, and leaves images alone', async () => {
    const token = ['ghp', 'abcdefghijklmnopqrstuvwxyz0123456789'].join('_');
    const image = { type: 'image', data: 'tok_live_9f8e7d6c5b4a39281706', mimeType: 'image/png' };
    const r = await sb.engine.redactResult({
      toolName: 'bash',
      content: [{ type: 'text', text: `export GH=${token}` }, image],
      details: { truncation: { lines: [`token ${token}`, 'tok_live_9f8e7d6c5b4a39281706'] }, exitCode: 0 }
    });
    expect(out(r)).toMatch(/^export GH=«secret:TOKEN#[0-9a-f]{4}»$/);
    expect(r.content[1]).toBe(image);
    expect(JSON.stringify(r.details)).not.toMatch(/ghp_|tok_live/);
    expect((r.details as { exitCode: number }).exitCode).toBe(0);
  });

  it('restores placeholders into an edit of .env so oldText matches the file', async () => {
    const placeholder = /«secret:ACCESS_TOKEN#[0-9a-f]{4}»/.exec(out(await redact(ENV_FILE)))[0];
    const call = {
      toolCallId: `edit-${++n}`,
      toolName: 'edit',
      input: {
        path: '.env',
        edits: [{ oldText: `ACCESS_TOKEN=${placeholder}`, newText: `ACCESS_TOKEN=${placeholder}\nNEW_FLAG=1` }]
      }
    };
    const d = await sb.engine.evaluate(call, { mode: 'workspace', grants: [] });
    expect(d.decision).toBe('allow');
    sb.engine.restoreInput(d, call.input);
    expect(call.input.edits[0].oldText).toBe('ACCESS_TOKEN=tok_live_9f8e7d6c5b4a39281706');
    expect(call.input.edits[0].newText).toBe('ACCESS_TOKEN=tok_live_9f8e7d6c5b4a39281706\nNEW_FLAG=1');
  });

  it('asks before a secret goes into a plain file, and leaves the placeholder literal there', async () => {
    const placeholder = /«secret:ACCESS_TOKEN#[0-9a-f]{4}»/.exec(out(await redact(ENV_FILE)))[0];
    for (const content of [`export const t = '${placeholder}';`, "export const t = 'tok_live_9f8e7d6c5b4a39281706';"]) {
      const call = { toolCallId: `write-${++n}`, toolName: 'write', input: { path: 'src/config.ts', content } };
      const d = await sb.engine.evaluate(call, { mode: 'workspace', grants: [] });
      expect(d.request.signals).toContain('secret-into-plain-file');
      expect(asAsk(d).grantOptions).toEqual([]);
      sb.engine.restoreInput(d, call.input, { approved: true });
      expect(call.input.content).toBe(content);
    }
  });

  it('asks for a placeholder in bash and restores it only once approved', async () => {
    const placeholder = /«secret:ACCESS_TOKEN#[0-9a-f]{4}»/.exec(out(await redact(ENV_FILE)))[0];
    const command = `curl -H "Authorization: Bearer ${placeholder}" http://localhost:3000/api`;
    const call = { toolCallId: `bash-${++n}`, toolName: 'bash', input: { command } };
    const d = await sb.engine.evaluate(call, { mode: 'workspace', grants: [] });
    expect(d.decision).toBe('ask');
    expect(d.request.signals).toContain('placeholder-in-command');
    sb.engine.restoreInput(d, call.input);
    expect(call.input.command).toBe(command);
    sb.engine.restoreInput(d, call.input, { approved: true });
    expect(call.input.command).toBe('curl -H "Authorization: Bearer tok_live_9f8e7d6c5b4a39281706" http://localhost:3000/api');
  });

  it('picks up a value a writing tool just wrote, with no host refresh', async () => {
    await fs.appendFile(path.join(sb.ws, '.env'), 'WRITTEN_API_KEY=written-by-bash-0007\n');
    const bashResult = await sb.engine.redactResult({ toolName: 'bash', content: text('written-by-bash-0007') });
    expect(out(bashResult)).toMatch(/^«secret:WRITTEN_API_KEY#[0-9a-f]{4}»$/);
  });

  it('picks up a new value after the host refreshes', async () => {
    await fs.appendFile(path.join(sb.ws, '.env'), 'NEW_API_KEY=fresh-value-0042\n');
    expect(out(await redact('fresh-value-0042'))).toBe('fresh-value-0042');
    await sb.engine.refreshSecrets();
    expect(out(await redact('fresh-value-0042'))).toMatch(/^«secret:NEW_API_KEY#[0-9a-f]{4}»$/);
  });

  it('redacts secret-named environment values the host passes', async () => {
    await sb.engine.refreshSecrets({ env: { OPENAI_API_KEY: 'env-secret-value-77', HOME: '/Users/someone' } });
    expect(out(await redact('OPENAI_API_KEY=env-secret-value-77 HOME=/Users/someone'))).toMatch(
      /^OPENAI_API_KEY=«secret:OPENAI_API_KEY#[0-9a-f]{4}» HOME=\/Users\/someone$/
    );
  });
});
