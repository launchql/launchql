import env from './env';
import pg from 'pg';
import type { Pool, PoolClient } from 'pg';
import * as jobs from '@launchql/job-utils';
import type { PgClientLike } from '@launchql/job-utils';

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pgPoolConfig = {
  connectionString: getDbString()
};

function once<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: unknown
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let result: ReturnType<T> | undefined;
  return function (this: unknown, ...args: Parameters<T>) {
    if (fn) {
      result = fn.apply((context ?? this) as never, args) as ReturnType<T>;
      fn = null as unknown as T;
    }
    return result;
  };
}

export interface JobRow {
  id: number | string;
  task_identifier: string;
  payload?: unknown;
}

export interface WorkerContext {
  pgPool: Pool;
  workerId: string;
}

export type TaskHandler = (
  ctx: WorkerContext,
  job: JobRow
) => Promise<void> | void;

/* eslint-disable no-console */

export default class Worker {
  tasks: Record<string, TaskHandler>;
  idleDelay: number;
  supportedTaskNames: string[];
  workerId: string;
  doNextTimer?: NodeJS.Timeout;
  pgPool: Pool;
  _ended?: boolean;

  // tasks is required; other options are optional
  constructor({
    tasks,
    idleDelay = 15000,
    pgPool = new (pg as any).Pool(pgPoolConfig),
    workerId = 'worker-0'
  }: {
    tasks: Record<string, TaskHandler>;
    idleDelay?: number;
    pgPool?: Pool;
    workerId?: string;
  }) {
    this.tasks = tasks;
    /*
     * idleDelay: This is how long to wait between polling for jobs.
     *
     * Note: this does NOT need to be short, because we use LISTEN/NOTIFY to be
     * notified when new jobs are added - this is just used in the case where
     * LISTEN/NOTIFY fails for whatever reason.
     */
    this.idleDelay = idleDelay;

    this.supportedTaskNames = Object.keys(this.tasks);
    this.workerId = workerId;
    this.doNextTimer = undefined;
    this.pgPool = pgPool;
    const close = () => {
      console.log('closing connection...');
      this.close();
    };
    process.once('SIGTERM', close);
    process.once('SIGINT', close);
  }
  close() {
    if (!this._ended) {
      this.pgPool.end();
    }
    this._ended = true;
  }
  handleFatalError({
    err,
    fatalError,
    jobId
  }: {
    err?: Error;
    fatalError: unknown;
    jobId: JobRow['id'];
  }) {
    const when = err ? `after failure '${err.message}'` : 'after success';
    console.error(
      `Failed to release job '${jobId}' ${when}; committing seppuku`
    );
    console.error(fatalError);
    process.exit(1);
  }
  async handleError(
    client: PgClientLike,
    { err, job, duration }: { err: Error; job: JobRow; duration: string }
  ) {
    console.error(
      `Failed task ${job.id} (${job.task_identifier}) with error ${err.message} (${duration}ms)`,
      { err, stack: err.stack }
    );
    console.error(err.stack);
    await jobs.failJob(client, {
      workerId: this.workerId,
      jobId: job.id,
      message: err.message
    });
  }
  async handleSuccess(
    client: PgClientLike,
    { job, duration }: { job: JobRow; duration: string }
  ) {
    console.log(
      `Completed task ${job.id} (${job.task_identifier}) with success (${duration}ms)`
    );
    await jobs.completeJob(client, { workerId: this.workerId, jobId: job.id });
  }
  async doWork(job: JobRow) {
    const { task_identifier } = job;
    const worker = this.tasks[task_identifier];
    if (!worker) {
      throw new Error('Unsupported task');
    }
    await worker(
      {
        pgPool: this.pgPool,
        workerId: this.workerId
      },
      job
    );
  }
  async doNext(client: PgClientLike): Promise<void> {
    if (this.doNextTimer) {
      clearTimeout(this.doNextTimer);
      this.doNextTimer = undefined;
    }
    try {
      const job = (await jobs.getJob<JobRow>(client, {
        workerId: this.workerId,
        supportedTaskNames: this.supportedTaskNames
      })) as JobRow | undefined;
      if (!job || !job.id) {
        this.doNextTimer = setTimeout(
          () => this.doNext(client),
          this.idleDelay
        );
        return;
      }
      const start = process.hrtime();

      let err: Error | null = null;
      try {
        await this.doWork(job);
      } catch (error) {
        err = error as Error;
      }
      const durationRaw = process.hrtime(start);
      const duration = ((durationRaw[0] * 1e9 + durationRaw[1]) / 1e6).toFixed(
        2
      );
      const jobId = job.id;
      try {
        if (err) {
          await this.handleError(client, { err, job, duration });
        } else {
          await this.handleSuccess(client, { job, duration });
        }
      } catch (fatalError: unknown) {
        this.handleFatalError({ err, fatalError, jobId });
      }
      return this.doNext(client);
    } catch (err: unknown) {
      this.doNextTimer = setTimeout(() => this.doNext(client), this.idleDelay);
    }
  }
  listen() {
    const listenForChanges = (
      err: Error | null,
      client: PoolClient,
      release: () => void
    ) => {
      if (err) {
        console.error('Error connecting with notify listener', err);
        // Try again in 5 seconds
        // should this really be done in the node process?
        setTimeout(this.listen, 5000);
        return;
      }
      client.on('notification', () => {
        if (this.doNextTimer) {
          // Must be idle, do something!
          this.doNext(client);
        }
      });
      client.query('LISTEN "jobs:insert"');
      client.on('error', (e: unknown) => {
        console.error('Error with database notify listener', e);
        release();
        this.listen();
      });
      console.log(`${this.workerId} connected and looking for jobs...`);
      this.doNext(client);
    };
    this.pgPool.connect(listenForChanges);
  }
}

export { Worker };
