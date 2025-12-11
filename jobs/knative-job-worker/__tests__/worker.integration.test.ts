process.env.KNATIVE_SERVICE_URL =
  process.env.KNATIVE_SERVICE_URL || 'http://knative.internal';
process.env.INTERNAL_JOBS_CALLBACK_URL =
  process.env.INTERNAL_JOBS_CALLBACK_URL ||
  'http://callback.internal/jobs-complete';

const postMock = jest.fn();

jest.mock('request', () => ({
  __esModule: true,
  default: { post: postMock },
  post: postMock
}));

jest.mock('@launchql/job-pg', () => ({
  __esModule: true,
  default: {
    getPool: jest.fn(),
    onClose: jest.fn(),
    close: jest.fn()
  }
}));

import path from 'path';
import { getConnections, seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import * as jobUtils from '@launchql/job-utils';
import Worker from '../src';

let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  const modulePath = path.resolve(
    __dirname,
    '../../../extensions/@launchql/ext-jobs'
  );
  ({ db, teardown } = await getConnections({}, [seed.launchql(modulePath)]));
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();
  postMock.mockReset();
});

afterEach(async () => {
  await db.afterEach();
});

describe('knative worker integration with job queue', () => {
  const databaseId = '5b720132-17d5-424d-9bcb-ee7b17c13d43';

  it('pulls a job from the queue and posts to Knative service', async () => {
    const insertedJob = await db.one(
      'SELECT * FROM app_jobs.add_job($1::uuid, $2::text, $3::json);',
      [databaseId, 'example-fn', { hello: 'world' }]
    );

    const worker = new Worker({
      tasks: ['example-fn'],
      pgPool: {} as any,
      workerId: 'worker-integration-1'
    });

    const job = await jobUtils.getJob(db as any, {
      workerId: 'worker-integration-1',
      supportedTaskNames: null
    });

    expect(job).toBeTruthy();
    expect(job.id).toBe(insertedJob.id);

    postMock.mockImplementation(
      (options: any, callback: (err: any) => void) => callback(null)
    );

    await (worker as any).doWork(job);

    expect(postMock).toHaveBeenCalledTimes(1);
    const [options] = postMock.mock.calls[0];
    expect(options.url).toBe('http://knative.internal/example-fn');
    expect(options.headers['X-Job-Id']).toBe(job.id);
    expect(options.headers['X-Database-Id']).toBe(databaseId);
  });

  it('propagates errors from failed Knative calls while keeping job queue interactions intact', async () => {
    await db.one(
      'SELECT * FROM app_jobs.add_job($1::uuid, $2::text, $3::json);',
      [databaseId, 'example-fn', { hello: 'world' }]
    );

    const worker = new Worker({
      tasks: ['example-fn'],
      pgPool: {} as any,
      workerId: 'worker-integration-2'
    });

    const job = await jobUtils.getJob(db as any, {
      workerId: 'worker-integration-2',
      supportedTaskNames: null
    });

    postMock.mockImplementation(
      (options: any, callback: (err: any) => void) =>
        callback(new Error('knative failure'))
    );

    await expect((worker as any).doWork(job)).rejects.toThrow(
      'knative failure'
    );
  });
});

