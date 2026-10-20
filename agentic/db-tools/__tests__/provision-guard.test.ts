import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The network boundary: requestDatabase on the api client, the ticket read and
// the lookup by name on the modules client, and the ownership probe.
const mockRequestDatabase = jest.fn();
const mockFindTicket = jest.fn();
const mockListOwn = jest.fn();
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
        findMany: (args: unknown) => ({ unwrap: () => mockListOwn(args) }),
      },
    }),
  },
}));
jest.mock('../src/db-probe', () => ({ probeDatabase: jest.fn() }));

import type { RunCommand } from '../src/app-workspace';
import { type DatabaseProbe, probeDatabase } from '../src/db-probe';
import { configureHost, type ToolsHost } from '../src/host';
import { provisionDatabase, type ProvisionInput } from '../src/provision-database/provision';
import { createProvisionDatabaseTool } from '../src/tools/provision-database';

const mockProbe = probeDatabase as jest.MockedFunction<typeof probeDatabase>;
const API = 'http://api.localhost:3000/graphql';

type Ticket = { id: string; status: string; bootstrapStatus: string; databaseId: string | null; createdAt?: string };
const pending = (id: string): Ticket => ({ id, status: 'pending', bootstrapStatus: 'pending', databaseId: null });
const completed = (id: string, databaseId: string): Ticket => ({
  id,
  status: 'completed',
  bootstrapStatus: 'completed',
  databaseId,
});
const ticketRead = (ticket: Ticket | null) => ({ databaseProvisionModule: ticket });
const requested = (ticket: Ticket) => ({ requestDatabase: { result: ticket } });
const listed = (...tickets: Ticket[]) => ({ databaseProvisionModules: { nodes: tickets } });

const record = (fields: Partial<Record<'id' | 'name' | 'api' | 'attempts', string>> = {}) =>
  [
    `PROVISION_TICKET_ID=${fields.id ?? 'ticket-1'}`,
    `PROVISION_TICKET_DATABASE_NAME=${fields.name ?? 'myapp'}`,
    `PROVISION_TICKET_API_ENDPOINT=${fields.api ?? API}`,
    'PROVISION_TICKET_USER_ID=user-1',
    `PROVISION_TICKET_ATTEMPTS=${fields.attempts ?? '1'}`,
  ].join('\n') + '\n';

let cwd: string;
let persistBinding: jest.Mock;
const envPath = () => path.join(cwd, '.env');
const envFile = () => readFileSync(envPath(), 'utf8');
const writeEnv = (content: string) => writeFileSync(envPath(), content);

// No packages/app, so the prewarm only tries a template clone, which this
// runner refuses: nothing touches the network or the disk outside cwd.
const refuse: RunCommand = async () => ({ ok: false, out: 'not run in tests' });
const provision = (name: string, reprovision?: boolean) =>
  createProvisionDatabaseTool(refuse).execute(
    { database_name: name, ...(reprovision ? { reprovision } : {}) },
    { cwd },
  );
const hostProvision = (input: Partial<ProvisionInput> = {}) =>
  provisionDatabase({ databaseName: 'myapp', ...input }, { cwd }, refuse);

const found = (databaseId: string, ownerId = 'user-1'): DatabaseProbe => ({
  status: 'found',
  databaseId,
  ownerId,
  name: 'myapp',
});

function useHost(extra: Partial<ToolsHost> = {}) {
  configureHost({
    account: () => ({ userId: 'user-1', accessToken: 'account-token' }),
    backendConfig: () => ({ apiEndpoint: API, modulesEndpoint: 'http://modules.localhost:3000/graphql' }),
    provisionPollDeadlineMs: 1,
    persistBinding,
    ...extra,
  });
}

beforeEach(() => {
  cwd = mkdtempSync(path.join(os.tmpdir(), 'db-tools-guard-'));
  mockRequestDatabase.mockReset();
  mockFindTicket.mockReset();
  mockListOwn.mockReset();
  mockListOwn.mockResolvedValue(listed());
  mockProbe.mockReset();
  mockProbe.mockImplementation(async ({ databaseId }) => found(databaseId));
  persistBinding = jest.fn(async (): Promise<void> => undefined);
  useHost();
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe('a binding is DATABASE_ID alone', () => {
  it('heals a partial .env from the live database without requesting one', async () => {
    writeEnv('DATABASE_ID=db-1\n');

    const result = await provision('myapp');

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({ success: true, skipped: true, databaseId: 'db-1', databaseName: 'myapp' });
    expect(envFile()).toMatch(/^ACCESS_TOKEN=account-token$/m);
    expect(envFile()).toMatch(/^DATABASE_NAME=myapp$/m);
    expect(envFile()).toMatch(/^OWNER_ID=user-1$/m);
    expect(persistBinding).toHaveBeenCalledWith(expect.objectContaining({ databaseId: 'db-1', skipped: true }));
  });

  it('makes one request when two calls race on an unbound project', async () => {
    mockRequestDatabase.mockResolvedValue(requested(completed('ticket-1', 'db-1')));

    const [first, second] = await Promise.all([provision('myapp'), provision('myapp')]);

    expect(mockRequestDatabase).toHaveBeenCalledTimes(1);
    expect(first.details).toMatchObject({ success: true, databaseId: 'db-1' });
    expect(second.details).toMatchObject({ success: true, skipped: true, databaseId: 'db-1' });
  });
});

describe('lost and recorded tickets', () => {
  it('follows an in-flight ticket found by name when the recorded one reads back empty', async () => {
    writeEnv(record());
    mockFindTicket.mockImplementation(async (id: string) =>
      ticketRead(id === 'ticket-2' ? completed('ticket-2', 'db-2') : null),
    );
    mockListOwn.mockResolvedValue(listed(pending('ticket-2')));

    const result = await provision('myapp');

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(mockListOwn).toHaveBeenCalledWith(
      expect.objectContaining({ where: { databaseName: { equalTo: 'myapp' }, ownerId: { equalTo: 'user-1' } } }),
    );
    expect(result.details).toMatchObject({ success: true, recovered: true, resumed: true, databaseId: 'db-2' });
    expect(envFile()).toMatch(/^DATABASE_ID=db-2$/m);
  });

  it('stops with ticket-lost, creating nothing, when no provision of that name is in flight', async () => {
    writeEnv(record());
    mockFindTicket.mockResolvedValue(ticketRead(null));
    // A completed one is never followed: it may be another project's database.
    mockListOwn.mockResolvedValue(listed(completed('ticket-0', 'db-0')));

    const result = await provision('myapp');

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({ success: false, code: 'ticket-lost' });
    expect(envFile()).not.toMatch(/PROVISION_TICKET_ID|DATABASE_ID/);
  });

  it('refuses another name while a provision is recorded for this project', async () => {
    writeEnv(record({ name: 'otherapp' }));

    const result = await provision('myapp');

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({ success: false, code: 'pending-other', ticketId: 'ticket-1' });
    expect(envFile()).toBe(record({ name: 'otherapp' }));
  });

  it('archives a record from another backend and requests', async () => {
    writeEnv(record({ api: 'http://api.example.test/graphql' }));
    mockRequestDatabase.mockResolvedValue(requested(completed('ticket-2', 'db-2')));

    const result = await provision('myapp');

    expect(mockRequestDatabase).toHaveBeenCalledTimes(1);
    expect(result.details).toMatchObject({ success: true, databaseId: 'db-2' });
    expect(envFile()).toMatch(/^# archived \d{4}-\d{2}-\d{2}: PROVISION_TICKET_ID=ticket-1$/m);
  });

  it('finds the ticket on the backend when recording it failed, so the retry makes no second request', async () => {
    mkdirSync(envPath()); // writing .env fails
    mockRequestDatabase.mockResolvedValue(requested(pending('ticket-1')));
    mockFindTicket.mockResolvedValueOnce(ticketRead(pending('ticket-1')));
    mockListOwn.mockImplementation(async () =>
      listed(...(mockRequestDatabase.mock.calls.length > 0 ? [pending('ticket-1')] : [])),
    );

    const first = await provision('myapp');
    rmSync(envPath(), { recursive: true });
    mockFindTicket.mockResolvedValue(ticketRead(completed('ticket-1', 'db-1')));
    const second = await provision('myapp');

    expect(first.details).toMatchObject({ success: false, pending: true });
    expect(first.details.message).toMatch(/Recording its ticket in .env failed/);
    expect(second.details).toMatchObject({ success: true, recovered: true, databaseId: 'db-1' });
    expect(mockRequestDatabase).toHaveBeenCalledTimes(1);
  });

  it('stops at the attempt cap with provision-stuck, and requests again only when the host abandons it', async () => {
    writeEnv(record({ attempts: '5' }));
    mockFindTicket.mockResolvedValue(ticketRead(pending('ticket-1')));
    mockListOwn.mockResolvedValue(listed(pending('ticket-1')));

    const stuck = await provision('myapp');
    const again = await provision('myapp');
    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(stuck.details).toMatchObject({ success: false, code: 'provision-stuck', ticketId: 'ticket-1' });
    expect(stuck.details.pending).toBeUndefined();
    expect(again.details.code).toBe('provision-stuck');
    expect(envFile()).toMatch(/^PROVISION_TICKET_ID=ticket-1$/m);

    mockRequestDatabase.mockResolvedValue(requested(completed('ticket-2', 'db-2')));
    const abandoned = await hostProvision({ abandonPending: true });

    expect(mockRequestDatabase).toHaveBeenCalledTimes(1);
    expect(abandoned).toMatchObject({ success: true, databaseId: 'db-2' });
    expect(envFile()).toMatch(/^PROVISION_TICKET_ABANDONED=ticket-1$/m);
  });
});

describe('replace mode', () => {
  it('refuses when the binding is no longer the one the caller saw', async () => {
    writeEnv('DATABASE_ID=db-new\n');

    const result = await hostProvision({ mode: 'replace', replaces: 'db-old' });

    expect(result.code).toBe('binding-changed');
    expect(mockProbe).not.toHaveBeenCalled();
    expect(mockRequestDatabase).not.toHaveBeenCalled();
  });

  it.each<[string, DatabaseProbe, string]>([
    ['live', found('db-old'), 'binding-live'],
    ['suspended', { status: 'suspended', databaseId: 'db-old', ownerId: 'user-1', suspendedAt: '2026-10-01' }, 'db-suspended'],
  ])('refuses to replace a %s binding', async (_case, probe, code) => {
    writeEnv('DATABASE_ID=db-old\n');
    mockProbe.mockResolvedValue(probe);

    const result = await hostProvision({ mode: 'replace', replaces: 'db-old' });

    expect(result.code).toBe(code);
    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(envFile()).toBe('DATABASE_ID=db-old\n');
  });

  it('archives a missing binding and binds a new database in its place', async () => {
    writeEnv('DATABASE_ID=db-old\nDATABASE_NAME=myapp\n');
    mockProbe.mockImplementation(async ({ databaseId }) =>
      databaseId === 'db-old' ? { status: 'missing', databaseId } : found(databaseId),
    );
    mockRequestDatabase.mockResolvedValue(requested(completed('ticket-2', 'db-2')));

    const result = await hostProvision({ mode: 'replace', replaces: 'db-old' });

    expect(mockRequestDatabase).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ success: true, databaseId: 'db-2', replaced: 'db-old' });
    expect(envFile()).toMatch(/^# archived \d{4}-\d{2}-\d{2}: DATABASE_ID=db-old$/m);
    expect(envFile()).toMatch(/^DATABASE_ID=db-2$/m);
    expect(persistBinding).toHaveBeenCalledWith(expect.objectContaining({ databaseId: 'db-2', replaces: 'db-old' }));
  });

  it("refuses the tool's reprovision when the host turned it off", async () => {
    useHost({ toolReprovision: false, reprovisionHint: 'Approve the rebuild card in the app.' });
    writeEnv('DATABASE_ID=db-old\n');

    const result = await provision('myapp', true);

    expect(result.details).toMatchObject({ success: false, code: 'reprovision-not-allowed' });
    expect(result.details.message).toMatch(/Approve the rebuild card/);
    expect(mockProbe).not.toHaveBeenCalled();
    expect(mockRequestDatabase).not.toHaveBeenCalled();
  });
});

describe('saving the binding', () => {
  it('hands the binding to the host before .env is written', async () => {
    mockRequestDatabase.mockResolvedValue(requested(completed('ticket-1', 'db-1')));
    const envAtSave: string[] = [];
    persistBinding.mockImplementation(async () => {
      envAtSave.push(existsSync(envPath()) ? envFile() : '');
    });

    const result = await provision('myapp');

    expect(result.details.success).toBe(true);
    expect(envAtSave).toHaveLength(1);
    expect(envAtSave[0]).not.toMatch(/DATABASE_ID/);
    expect(envFile()).toMatch(/^DATABASE_ID=db-1$/m);
  });

  it('keeps the ticket when the host cannot save it, and the retry binds it without a second request', async () => {
    mockRequestDatabase.mockResolvedValue(requested(completed('ticket-1', 'db-1')));
    mockFindTicket.mockResolvedValue(ticketRead(completed('ticket-1', 'db-1')));
    persistBinding.mockRejectedValueOnce(new Error('store is locked'));

    const failed = await provision('myapp');
    expect(failed.details).toMatchObject({ success: false, code: 'binding-not-saved', databaseId: 'db-1' });
    expect(envFile()).not.toMatch(/^DATABASE_ID=/m);
    expect(envFile()).toMatch(/^PROVISION_TICKET_ID=ticket-1$/m);

    const retried = await provision('myapp');

    expect(retried.details).toMatchObject({ success: true, resumed: true, databaseId: 'db-1' });
    expect(mockRequestDatabase).toHaveBeenCalledTimes(1);
  });
});

describe('a taken name', () => {
  it("reports this account's database holding it, and never binds it", async () => {
    mockRequestDatabase.mockRejectedValue(new Error('database "myapp" already exists'));
    mockListOwn.mockResolvedValue(listed({ ...completed('ticket-0', 'db-9'), createdAt: '2026-10-20T08:00:00Z' }));

    const result = await provision('myapp');

    expect(mockRequestDatabase).toHaveBeenCalledTimes(1);
    expect(result.details).toMatchObject({
      success: false,
      code: 'name-taken',
      heldBy: { databaseId: 'db-9', yours: true, createdAt: '2026-10-20T08:00:00Z' },
    });
    expect(persistBinding).not.toHaveBeenCalled();
  });

  it('lets the host adopt that database without a request', async () => {
    const result = await hostProvision({ adopt: 'db-9' });

    expect(mockRequestDatabase).not.toHaveBeenCalled();
    expect(result).toMatchObject({ success: true, databaseId: 'db-9' });
    expect(envFile()).toMatch(/^DATABASE_ID=db-9$/m);
  });
});
