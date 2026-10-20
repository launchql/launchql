import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The network boundary: requestDatabase on the api client, the ticket read on
// the modules client, and the ownership probe.
const mockRequestDatabase = jest.fn();
const mockFindTicket = jest.fn();
jest.mock('@constructive-io/sdk', () => ({
  api: {
    FetchAdapter: jest.fn(),
    createClient: () => ({
      mutation: { requestDatabase: (...args: unknown[]) => ({ unwrap: () => mockRequestDatabase(...args) }) },
    }),
  },
  modules: {
    createClient: () => ({
      databaseProvisionModule: {
        findOne: (args: { id: string }) => ({ unwrap: () => mockFindTicket(args.id) }),
      },
    }),
  },
}));
jest.mock('../src/db-probe', () => ({ probeDatabase: jest.fn() }));

import type { RunCommand } from '../src/app-workspace';
import { probeDatabase } from '../src/db-probe';
import { configureHost } from '../src/host';
import { createProvisionDatabaseTool } from '../src/tools/provision-database';

const mockProbe = probeDatabase as jest.MockedFunction<typeof probeDatabase>;
const API = 'http://api.localhost:3000/graphql';

const pending = (id: string) => ({ id, status: 'pending', bootstrapStatus: 'pending', databaseId: null as string | null });
const completed = (id: string, databaseId: string) => ({
  id,
  status: 'completed',
  bootstrapStatus: 'completed',
  databaseId,
});
const ticketRead = (ticket: unknown) => ({ databaseProvisionModule: ticket });
const requested = (ticket: unknown) => ({ requestDatabase: { result: ticket } });
const graphqlError = (message: string) =>
  Object.assign(new Error(`GraphQL Error: ${message}`), { errors: [{ message }] });

const record = (fields: Partial<Record<'id' | 'name' | 'api' | 'user' | 'attempts', string>> = {}) =>
  [
    `PROVISION_TICKET_ID=${fields.id ?? 'ticket-1'}`,
    `PROVISION_TICKET_DATABASE_NAME=${fields.name ?? 'myapp'}`,
    `PROVISION_TICKET_API_ENDPOINT=${fields.api ?? API}`,
    `PROVISION_TICKET_USER_ID=${fields.user ?? 'user-1'}`,
    `PROVISION_TICKET_ATTEMPTS=${fields.attempts ?? '1'}`,
  ].join('\n') + '\n';

let cwd: string;
const envFile = () => readFileSync(path.join(cwd, '.env'), 'utf8');
const envLines = () => envFile().split('\n').filter(Boolean);
const writeEnv = (content: string) => writeFileSync(path.join(cwd, '.env'), content);

// No packages/app, so the prewarm only tries a template clone, which this
// runner refuses: nothing touches the network or the disk outside cwd.
const refuse: RunCommand = async () => ({ ok: false, out: 'not run in tests' });
const provision = (name: string, exec: RunCommand = refuse) =>
  createProvisionDatabaseTool(exec).execute({ database_name: name }, { cwd });

beforeEach(() => {
  cwd = mkdtempSync(path.join(os.tmpdir(), 'db-tools-provision-'));
  mockRequestDatabase.mockReset();
  mockFindTicket.mockReset();
  mockProbe.mockReset();
  mockProbe.mockResolvedValue({ status: 'found', databaseId: 'db-1', ownerId: 'user-1' });
  configureHost({
    account: () => ({ userId: 'user-1', accessToken: 'account-token' }),
    backendConfig: () => ({ apiEndpoint: API, modulesEndpoint: 'http://modules.localhost:3000/graphql' }),
    provisionPollDeadlineMs: 1,
  });
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe('provision_database pending tickets', () => {
  it('records the ticket with its backend and account when it stops waiting, and changes nothing else', async () => {
    writeEnv('KEEP=me\n');
    mockRequestDatabase.mockResolvedValue(requested(pending('ticket-1')));
    mockFindTicket.mockResolvedValue(ticketRead(pending('ticket-1')));

    const result = await provision('myapp');

    expect(result.details).toMatchObject({ success: false, pending: true, ticketId: 'ticket-1' });
    expect(result.details.message).toMatch(/call provision_database again with database_name "myapp"/);
    expect(envLines()).toEqual(['KEEP=me', ...record().trim().split('\n')]);
  });

  it('resumes the recorded ticket for the same name, backend and account, and clears it once bound', async () => {
    writeEnv(`KEEP=me\n${record()}`);
    mockFindTicket.mockResolvedValue(ticketRead(completed('ticket-1', 'db-1')));

    const result = await provision('myapp');

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(mockFindTicket).toHaveBeenCalledWith('ticket-1');
    expect(result.details).toMatchObject({ success: true, resumed: true, databaseId: 'db-1' });
    expect(envLines().slice(0, 2)).toEqual(['KEEP=me', 'DATABASE_ID=db-1']);
    expect(envFile()).not.toMatch(/PROVISION_TICKET/);
  });

  it("surfaces a failed ticket's error and clears the record", async () => {
    writeEnv(`KEEP=me\n${record()}`);
    mockFindTicket.mockResolvedValue(
      ticketRead({ ...pending('ticket-1'), status: 'failed', errorMessage: 'provision job crashed' }),
    );

    const result = await provision('myapp');

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/provision job crashed/);
    expect(envFile()).toBe('KEEP=me\n');
  });

  it('keeps the record when the backend cannot be reached, rather than requesting again', async () => {
    writeEnv(`KEEP=me\n${record()}`);
    mockFindTicket.mockRejectedValue(new TypeError('fetch failed'));

    const result = await provision('myapp');

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({ success: false, pending: true, ticketId: 'ticket-1' });
    expect(envLines()).toContain('PROVISION_TICKET_ATTEMPTS=2');
  });

  it('clears the record and fails clearly when reading the ticket gets an answer that is an error', async () => {
    writeEnv(`KEEP=me\n${record()}`);
    mockFindTicket.mockRejectedValue(graphqlError('jwt expired'));

    const result = await provision('myapp');

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(result.details.pending).toBeUndefined();
    expect(result.details.message).toMatch(/ticket-1 could not be read: .*jwt expired/);
    expect(envFile()).toBe('KEEP=me\n');
  });

  it('stops following a ticket after the attempt cap, and says a new call starts a new provision', async () => {
    writeEnv(`KEEP=me\n${record({ attempts: '5' })}`);
    mockFindTicket.mockResolvedValue(ticketRead(pending('ticket-1')));

    const result = await provision('myapp');

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(result.details.pending).toBeUndefined();
    expect(result.details.message).toMatch(/still not ready after 5 waits.*a new call starts a new provision/);
    expect(envFile()).toBe('KEEP=me\n');
  });

  it.each([
    ['another name', { name: 'otherapp' }],
    ['another backend', { api: 'http://api.example.test/graphql' }],
    ['another account', { user: 'user-2' }],
  ])('never reuses a ticket recorded for %s', async (_case, fields) => {
    writeEnv(record(fields));
    mockRequestDatabase.mockResolvedValue(requested(completed('ticket-2', 'db-2')));

    const result = await provision('myapp');

    expect(mockFindTicket).not.toHaveBeenCalledWith('ticket-1');
    expect(mockRequestDatabase).toHaveBeenCalledTimes(1);
    expect(result.details).toMatchObject({ success: true, databaseId: 'db-2' });
    expect(result.details.resumed).toBeUndefined();
  });

  it('does not bind a database the signed-in account does not own', async () => {
    writeEnv(`KEEP=me\n${record()}`);
    mockFindTicket.mockResolvedValue(ticketRead(completed('ticket-1', 'db-1')));
    mockProbe.mockResolvedValue({ status: 'found', databaseId: 'db-1', ownerId: 'user-2' });

    const result = await provision('myapp');

    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/isn't owned by the signed-in account, so it was not bound/);
    expect(envFile()).toBe('KEEP=me\n');
  });

  it('writes into the .env as it is when the provision ends, keeping edits made meanwhile', async () => {
    writeEnv('KEEP=me\n');
    mockRequestDatabase.mockImplementation(async () => {
      writeEnv('KEEP=me\nADDED_WHILE_WAITING=yes\n');
      return requested(completed('ticket-2', 'db-2'));
    });

    await provision('myapp');

    expect(envLines()).toEqual(expect.arrayContaining(['ADDED_WHILE_WAITING=yes', 'DATABASE_ID=db-2']));
  });

  it('reads and replaces quoted and exported keys the way the .env parser does', async () => {
    writeEnv(
      'export ACCESS_TOKEN="stale"\n' +
        record()
          .trim()
          .split('\n')
          .map((line) => `export ${line.replace('=', '="')}"`)
          .join('\n') +
        '\n',
    );
    mockFindTicket.mockResolvedValue(ticketRead(completed('ticket-1', 'db-1')));

    const result = await provision('myapp');

    expect(result.details).toMatchObject({ success: true, resumed: true });
    expect(envLines().filter((line) => line.includes('ACCESS_TOKEN'))).toEqual([
      'export ACCESS_TOKEN=account-token',
    ]);
    expect(envFile()).not.toMatch(/PROVISION_TICKET/);
  });

  it('joins the install a retry finds still running instead of starting a second one', async () => {
    // A composed app with no node_modules: the prewarm installs it, and this
    // install never finishes.
    const appDir = path.join(cwd, 'packages', 'app');
    mkdirSync(path.join(appDir, '.constructive'), { recursive: true });
    writeFileSync(path.join(appDir, '.constructive', 'compose.json'), '{}');
    writeFileSync(path.join(appDir, 'pnpm-lock.yaml'), "lockfileVersion: '9.0'\n");
    writeFileSync(path.join(appDir, 'package.json'), '{}');
    const installs: string[] = [];
    const hangingInstall: RunCommand = (cmd, args) => {
      installs.push([cmd, ...args].join(' '));
      return new Promise(() => {});
    };
    mockRequestDatabase.mockResolvedValue(requested(pending('ticket-1')));
    mockFindTicket.mockResolvedValue(ticketRead(pending('ticket-1')));

    const first = await provision('myapp', hangingInstall);
    const second = await provision('myapp', hangingInstall);

    expect(first.details.pending).toBe(true);
    expect(second.details.pending).toBe(true);
    expect(installs).toEqual(['pnpm install --frozen-lockfile --prefer-offline']);
    expect(existsSync(path.join(appDir, 'node_modules'))).toBe(false);
  });
});
