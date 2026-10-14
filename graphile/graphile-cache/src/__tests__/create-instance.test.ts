import { createGraphileInstance } from '../create-instance';

jest.mock('postgraphile', () => ({
  postgraphile: (...args: unknown[]) => mockPostgraphile(...args),
}));

jest.mock('express', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockExpress(...args),
}));

jest.mock('node:http', () => ({
  createServer: (...args: unknown[]) => mockCreateServer(...args),
}));

jest.mock('grafserv/express/v4', () => ({ grafserv: jest.fn() }));

jest.mock('graphile-realtime-subscriptions', () => ({
  RealtimeManager: function (...args: unknown[]) {
    return mockCreateRealtimeManager(...args);
  },
}));

jest.mock('@pgpmjs/logger', () => ({
  Logger: function () {
    return {
      info: (...args: unknown[]) => mockInfo(...args),
      warn: (...args: unknown[]) => mockWarn(...args),
      error: (...args: unknown[]) => mockError(...args),
    };
  },
}));

const mockPostgraphile = jest.fn();
const mockExpress = jest.fn();
const mockCreateServer = jest.fn();
const mockCreateRealtimeManager = jest.fn();
const mockInfo = jest.fn();
const mockWarn = jest.fn();
const mockError = jest.fn();

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const flushAsyncWork = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('createGraphileInstance', () => {
  const preset = { grafserv: { graphqlPath: '/graphql' } };
  const cacheKey = 'readiness-test';
  const handler = jest.fn();
  const httpServer = { close: jest.fn() };
  const pgSubscriber = {};
  const pool = {};
  const releaseService = jest.fn();
  const schemaResult = { schema: {} };
  const manager = { start: jest.fn() };
  const serv = {
    addTo: jest.fn(),
    ready: jest.fn(),
  };
  const pgl = {
    createServ: jest.fn(),
    getSchemaResult: jest.fn(),
    getResolvedPreset: jest.fn(),
    release: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockPostgraphile.mockReturnValue(pgl);
    mockExpress.mockReturnValue(handler);
    mockCreateServer.mockReturnValue(httpServer);
    mockCreateRealtimeManager.mockReturnValue(manager);
    pgl.createServ.mockReturnValue(serv);
    pgl.getSchemaResult.mockResolvedValue(schemaResult);
    pgl.getResolvedPreset.mockReturnValue({
      pgServices: [{ pgSubscriber, adaptorSettings: { pool }, release: releaseService }],
    });
    pgl.release.mockResolvedValue(undefined);
    releaseService.mockResolvedValue(undefined);
    serv.addTo.mockResolvedValue(undefined);
    serv.ready.mockResolvedValue(undefined);
    manager.start.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(['schema', 'HTTP'] as const)(
    'waits for schema, HTTP and Grafserv before realtime when %s completes first',
    async (first) => {
      const schema = deferred<typeof schemaResult>();
      const attachment = deferred<void>();
      const ready = deferred<void>();
      const started = deferred<void>();
      pgl.getSchemaResult.mockReturnValue(schema.promise);
      serv.addTo.mockReturnValue(attachment.promise);
      serv.ready.mockReturnValue(ready.promise);
      manager.start.mockReturnValue(started.promise);

      const settled = jest.fn();
      const instance = createGraphileInstance({ preset, cacheKey, enableRealtime: true });
      void instance.then(settled, settled);
      await flushAsyncWork();

      expect(mockPostgraphile).toHaveBeenCalledWith(preset);
      expect(pgl.getSchemaResult).toHaveBeenCalledTimes(1);
      expect(mockCreateServer).toHaveBeenCalledWith(handler);
      expect(pgl.createServ).not.toHaveBeenCalled();
      expect(serv.addTo).not.toHaveBeenCalled();
      expect(serv.ready).not.toHaveBeenCalled();

      if (first === 'schema') {
        schema.resolve(schemaResult);
      } else {
        attachment.resolve();
      }
      await flushAsyncWork();
      expect(serv.ready).not.toHaveBeenCalled();
      expect(pgl.createServ).toHaveBeenCalledTimes(first === 'schema' ? 1 : 0);
      expect(mockCreateRealtimeManager).not.toHaveBeenCalled();
      expect(settled).not.toHaveBeenCalled();

      schema.resolve(schemaResult);
      attachment.resolve();
      await flushAsyncWork();
      expect(serv.addTo).toHaveBeenCalledWith(handler, httpServer);
      expect(serv.ready).toHaveBeenCalledTimes(1);
      expect(mockCreateRealtimeManager).not.toHaveBeenCalled();
      expect(settled).not.toHaveBeenCalled();

      ready.resolve();
      await flushAsyncWork();
      expect(mockCreateRealtimeManager).toHaveBeenCalledWith({
        pgSubscriber,
        pool,
        nodeId: `graphile-cache:${cacheKey}`,
        schema: 'realtime_public',
      });
      expect(manager.start).toHaveBeenCalledTimes(1);
      expect(settled).not.toHaveBeenCalled();

      started.resolve();
      await expect(instance).resolves.toEqual({
        pgl,
        serv,
        handler,
        httpServer,
        cacheKey,
        createdAt: expect.any(Number),
        realtimeManager: manager,
      });
      expect(pgl.release).not.toHaveBeenCalled();
      expect(releaseService).not.toHaveBeenCalled();
    },
  );

  it('accepts a synchronous schema result and void HTTP and Grafserv readiness results', async () => {
    pgl.getSchemaResult.mockReturnValue(schemaResult);
    serv.addTo.mockReturnValue(undefined);
    serv.ready.mockReturnValue(undefined);

    await expect(createGraphileInstance({ preset, cacheKey })).resolves.toMatchObject({
      pgl,
      serv,
      handler,
      httpServer,
      cacheKey,
    });
    expect(serv.ready).toHaveBeenCalledTimes(1);
    expect(mockCreateRealtimeManager).not.toHaveBeenCalled();
    expect(pgl.release).not.toHaveBeenCalled();
    expect(releaseService).not.toHaveBeenCalled();
  });

  it.each(['throws synchronously', 'rejects immediately'] as const)(
    'observes schema failure that %s before Grafserv construction and awaits cleanup',
    async (failure) => {
      const schemaError = new Error('schema failed before HTTP attachment');
      const attachment = deferred<void>();
      const released = deferred<void>();
      const serviceReleased = deferred<void>();
      if (failure === 'throws synchronously') {
        pgl.getSchemaResult.mockImplementationOnce(() => { throw schemaError; });
      } else {
        pgl.getSchemaResult.mockRejectedValueOnce(schemaError);
      }
      serv.addTo.mockReturnValue(attachment.promise);
      pgl.release.mockReturnValue(released.promise);
      releaseService.mockReturnValue(serviceReleased.promise);

      const settled = jest.fn();
      const instance = createGraphileInstance({ preset, cacheKey });
      void instance.then(settled, settled);
      const rejection = expect(instance).rejects.toBe(schemaError);
      expect(pgl.getSchemaResult).toHaveBeenCalledTimes(1);
      expect(pgl.createServ).not.toHaveBeenCalled();
      expect(serv.addTo).not.toHaveBeenCalled();
      expect(serv.ready).not.toHaveBeenCalled();

      // Cross a macrotask boundary so an unobserved schema rejection fails the test.
      await flushAsyncWork();
      expect(settled).not.toHaveBeenCalled();
      expect(pgl.release).toHaveBeenCalledTimes(1);
      expect(releaseService).not.toHaveBeenCalled();
      expect(settled).not.toHaveBeenCalled();

      released.resolve();
      await flushAsyncWork();
      expect(releaseService).toHaveBeenCalledTimes(1);
      expect(settled).not.toHaveBeenCalled();

      serviceReleased.resolve();
      await rejection;
      expect(mockError).not.toHaveBeenCalled();
    },
  );

  it('does not start HTTP attachment before schema settles, then preserves an attachment failure', async () => {
    const schema = deferred<typeof schemaResult>();
    const released = deferred<void>();
    const attachmentError = new Error('HTTP attachment failed');
    pgl.getSchemaResult.mockReturnValue(schema.promise);
    serv.addTo.mockRejectedValue(attachmentError);
    pgl.release.mockReturnValue(released.promise);

    const instance = createGraphileInstance({ preset, cacheKey, enableRealtime: true });
    const rejection = expect(instance).rejects.toBe(attachmentError);
    await flushAsyncWork();
    expect(pgl.createServ).not.toHaveBeenCalled();
    expect(serv.addTo).not.toHaveBeenCalled();
    expect(pgl.release).not.toHaveBeenCalled();

    schema.resolve(schemaResult);
    await flushAsyncWork();
    expect(pgl.createServ).toHaveBeenCalledTimes(1);
    expect(serv.addTo).toHaveBeenCalledTimes(1);
    expect(pgl.release).toHaveBeenCalledTimes(1);
    expect(releaseService).not.toHaveBeenCalled();
    expect(serv.ready).not.toHaveBeenCalled();
    released.resolve();
    await rejection;
    expect(releaseService).toHaveBeenCalledTimes(1);
    expect(mockCreateRealtimeManager).not.toHaveBeenCalled();
  });

  it('cleans up a synchronous createServ failure after schema completes', async () => {
    const failure = new Error('createServ failed');
    pgl.createServ.mockImplementation(() => { throw failure; });
    await expect(createGraphileInstance({ preset, cacheKey })).rejects.toBe(failure);
    expect(pgl.release).toHaveBeenCalledTimes(1);
    expect(releaseService).toHaveBeenCalledTimes(1);
    expect(serv.addTo).not.toHaveBeenCalled();
    expect(serv.ready).not.toHaveBeenCalled();
  });

  it('reports cleanup failure with the original build error as its cause', async () => {
    const buildError = new Error('Grafserv readiness failed');
    const releaseError = new Error('PostGraphile release failed');
    serv.ready.mockRejectedValue(buildError);
    pgl.release.mockRejectedValue(releaseError);

    await expect(createGraphileInstance({ preset, cacheKey })).rejects.toMatchObject({
      cause: buildError,
      errors: [buildError, releaseError],
    });
    expect(mockError).toHaveBeenCalledWith(
      `Failed to release PostGraphile[${cacheKey}] after build failure:`,
      releaseError,
    );
    expect(releaseService).toHaveBeenCalledTimes(1);
  });

  it('still returns a ready instance when realtime startup fails', async () => {
    const realtimeError = new Error('realtime unavailable');
    manager.start.mockRejectedValue(realtimeError);

    const entry = await createGraphileInstance({ preset, cacheKey, enableRealtime: true });

    expect(entry.pgl).toBe(pgl);
    expect(entry.realtimeManager).toBeUndefined();
    expect(mockError).toHaveBeenCalledWith(
      `Failed to start RealtimeManager for PostGraphile[${cacheKey}]:`,
      realtimeError,
    );
    expect(pgl.release).not.toHaveBeenCalled();
    expect(releaseService).not.toHaveBeenCalled();
  });

  it.each([
    { pgService: { adaptorSettings: { pool } }, missing: 'pgSubscriber' },
    { pgService: { pgSubscriber }, missing: 'pool in pgService' },
  ])('still skips realtime when $missing is absent', async ({ pgService, missing }) => {
    pgl.getResolvedPreset.mockReturnValue({ pgServices: [pgService] });

    const entry = await createGraphileInstance({ preset, cacheKey, enableRealtime: true });

    expect(entry.pgl).toBe(pgl);
    expect(entry.realtimeManager).toBeUndefined();
    expect(mockCreateRealtimeManager).not.toHaveBeenCalled();
    expect(mockWarn).toHaveBeenCalledWith(
      `PostGraphile[${cacheKey}] has no ${missing} — RealtimeManager will not be started`,
    );
    expect(pgl.release).not.toHaveBeenCalled();
  });
});
