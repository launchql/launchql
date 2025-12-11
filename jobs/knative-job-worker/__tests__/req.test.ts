const postMock = jest.fn();

jest.mock('request', () => ({
  __esModule: true,
  default: { post: postMock },
  post: postMock
}));

describe('knative request wrapper', () => {
  beforeEach(() => {
    jest.resetModules();
    postMock.mockReset();

    process.env.PGUSER = 'postgres';
    process.env.PGHOST = 'localhost';
    process.env.PGPASSWORD = 'password';
    process.env.PGPORT = '5432';
    process.env.PGDATABASE = 'jobs';
    process.env.JOBS_SCHEMA = 'app_jobs';
    process.env.INTERNAL_JOBS_CALLBACK_URL =
      'http://callback.internal/jobs-complete';
    process.env.NODE_ENV = 'test';
    delete process.env.INTERNAL_GATEWAY_URL;
    delete process.env.KNATIVE_SERVICE_URL;
    delete process.env.INTERNAL_GATEWAY_DEVELOPMENT_MAP;
  });

  it('uses KNATIVE_SERVICE_URL as base and preserves headers and body', async () => {
    process.env.KNATIVE_SERVICE_URL = 'http://knative.internal';

    postMock.mockImplementation(
      (options: any, callback: (err: any) => void) => callback(null)
    );

    const { request } = await import('../src/req');

    await request('example-fn', {
      body: { value: 1 },
      databaseId: 'db-123',
      workerId: 'worker-1',
      jobId: 42
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    const [options] = postMock.mock.calls[0];

    expect(options.url).toBe('http://knative.internal/example-fn');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['X-Worker-Id']).toBe('worker-1');
    expect(options.headers['X-Job-Id']).toBe(42);
    expect(options.headers['X-Database-Id']).toBe('db-123');
    expect(options.headers['X-Callback-Url']).toBe(
      'http://callback.internal/jobs-complete'
    );
    expect(options.body).toEqual({ value: 1 });
  });

  it('falls back to INTERNAL_GATEWAY_URL when KNATIVE_SERVICE_URL is not set', async () => {
    process.env.INTERNAL_GATEWAY_URL =
      'http://gateway.internal/async-function';

    postMock.mockImplementation(
      (options: any, callback: (err: any) => void) => callback(null)
    );

    const { request } = await import('../src/req');

    await request('example-fn', {
      body: { value: 2 },
      databaseId: 'db-456',
      workerId: 'worker-2',
      jobId: 43
    });

    const [options] = postMock.mock.calls[0];
    expect(options.url).toBe(
      'http://gateway.internal/async-function/example-fn'
    );
  });

  it('uses development map override when provided', async () => {
    process.env.KNATIVE_SERVICE_URL = 'http://knative.internal';
    process.env.INTERNAL_GATEWAY_DEVELOPMENT_MAP = JSON.stringify({
      'example-fn': 'http://localhost:3000/dev-fn'
    });
    process.env.NODE_ENV = 'development';

    postMock.mockImplementation(
      (options: any, callback: (err: any) => void) => callback(null)
    );

    const { request } = await import('../src/req');

    await request('example-fn', {
      body: {},
      databaseId: 'db-789',
      workerId: 'worker-3',
      jobId: 44
    });

    const [options] = postMock.mock.calls[0];
    expect(options.url).toBe('http://localhost:3000/dev-fn');
  });

  it('rejects when HTTP request errors', async () => {
    process.env.KNATIVE_SERVICE_URL = 'http://knative.internal';

    postMock.mockImplementation(
      (options: any, callback: (err: any) => void) =>
        callback(new Error('network failure'))
    );

    const { request } = await import('../src/req');

    await expect(
      request('example-fn', {
        body: {},
        databaseId: 'db-000',
        workerId: 'worker-4',
        jobId: 45
      })
    ).rejects.toThrow('network failure');
  });

  it('throws on startup when no base URL env vars are set', async () => {
    await expect(import('../src/env')).rejects.toThrow(
      /KNATIVE_SERVICE_URL \(or INTERNAL_GATEWAY_URL as fallback\) is required/
    );
  });
});
