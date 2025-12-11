import poolManager from '@launchql/job-pg';
import * as jobs from '@launchql/job-utils';
import type { PgClientLike } from '@launchql/job-utils';
import type { Pool, PoolClient } from 'pg';
import { request as req } from './req';
import env from './env';

export interface JobRow {
  id: number | string;
  task_identifier: string;
  payload?: unknown;
  database_id?: string;
}

/* eslint-disable no-console */
export default class Worker {
  idleDelay: number;
  supportedTaskNames: string[];
  workerId: string;
  doNextTimer?: NodeJS.Timeout;
  pgPool: Pool;
  _initialized?: boolean;

  constructor({
    tasks,
    idleDelay = 15000,
    pgPool = poolManager.getPool(),
    workerId = 'worker-0'
  }: {
    tasks: string[];
    idleDelay?: number;
    pgPool?: Pool;
    workerId?: string;
  }) {
    /*
     * idleDelay: This is how long to wait between polling for jobs.
     *
     * Note: this does NOT need to be short, because we use LISTEN/NOTIFY to be
     * notified when new jobs are added - this is just used in the case where
     * LISTEN/NOTIFY fails for whatever reason.
     */

    this.idleDelay = idleDelay;
    this.supportedTaskNames = tasks;
    this.workerId = workerId;
    this.doNextTimer = undefined;
    this.pgPool = pgPool;
    poolManager.onClose(async () => {
      await jobs.releaseJobs(pgPool, { workerId: this.workerId });
    });
  }
  async initialize(client: PgClientLike) {
    if (this._initialized === true) return;

    // release any jobs not finished from before if fatal error prevented cleanup
    await jobs.releaseJobs(client, { workerId: this.workerId });

    this._initialized = true;
    await this.doNext(client);
  }
  async handleFatalError(
    client: PgClientLike,
    {
      err,
      fatalError,
      jobId
    }: { err?: Error; fatalError: unknown; jobId: JobRow['id'] }
  ) {
    const when = err ? `after failure '${err.message}'` : 'after success';
    console.error(
      `worker: Failed to release job '${jobId}' ${when}; committing seppuku`
    );
    await poolManager.close();
    console.error(fatalError);
    process.exit(1);
  }
  async handleError(
    client: PgClientLike,
    { err, job, duration }: { err: Error; job: JobRow; duration: string }
  ) {
    console.error(
      `worker: Failed task ${job.id} (${job.task_identifier}) with error ${err.message} (${duration}ms)`,
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
      `worker: Async task ${job.id} (${job.task_identifier}) to be processed`
    );
  }
  async doWork(job: JobRow) {
    const { payload, task_identifier } = job;
    if (
      !env.JOBS_SUPPORT_ANY &&
      !this.supportedTaskNames.includes(task_identifier)
    ) {
      throw new Error('Unsupported task');
    }
    await req(task_identifier, {
      body: payload,
      databaseId: job.database_id,
      workerId: this.workerId,
      jobId: job.id
    });
  }
  async doNext(client: PgClientLike): Promise<void> {
    if (!this._initialized) {
      return await this.initialize(client);
    }

    console.log('worker: checking for jobs...');
    if (this.doNextTimer) {
      clearTimeout(this.doNextTimer);
      this.doNextTimer = undefined;
    }
    try {
      const job = (await jobs.getJob<JobRow>(client, {
        workerId: this.workerId,
        supportedTaskNames: env.JOBS_SUPPORT_ANY
          ? null
          : this.supportedTaskNames
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
        await this.handleFatalError(client, { err, fatalError, jobId });
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
        console.error('worker: Error connecting with notify listener', err);
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
        console.error('worker: Error with database notify listener', e);
        release();
        this.listen();
      });
      console.log(`worker: ${this.workerId} connected and looking for jobs...`);
      this.doNext(client);
    };
    this.pgPool.connect(listenForChanges);
  }
}

export { Worker };
