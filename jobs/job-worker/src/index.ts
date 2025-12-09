import poolManager from '@launchql/job-pg';
import * as jobs from '@launchql/job-utils';
import { request as req } from './req';
import { getJobSupportAny } from '@launchql/job-utils';
import type { Pool } from 'pg';

/* eslint-disable no-console */
export default class Worker {
  private idleDelay: number;
  private supportedTaskNames: string[];
  private workerId: string;
  private doNextTimer: NodeJS.Timeout | undefined;
  private pgPool: Pool;
  private _initialized?: boolean;

  constructor({
    tasks,
    idleDelay = 15000,
    pgPool = poolManager.getPool(),
    workerId = 'worker-0'
  }: { tasks?: string[]; idleDelay?: number; pgPool?: Pool; workerId?: string } = {}) {
    this.idleDelay = idleDelay;
    this.supportedTaskNames = tasks;
    this.workerId = workerId;
    this.doNextTimer = undefined;
    this.pgPool = pgPool;
    poolManager.onClose(jobs.releaseJobs, null, [
      this.pgPool,
      { workerId: this.workerId }
    ]);
  }
  async initialize(client: any) {
    if (this._initialized === true) return;
    await jobs.releaseJobs(client, { workerId: this.workerId });
    this._initialized = true;
    await this.doNext(client);
  }
  async handleFatalError(client: any, { err, fatalError, jobId }: any) {
    const when = err ? `after failure '${err.message}'` : 'after success';
    console.error(
      `worker: Failed to release job '${jobId}' ${when}; committing seppuku`
    );
    await poolManager.close();
    console.error(fatalError);
    process.exit(1);
  }
  async handleError(client: any, { err, job, duration }: any) {
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
  async handleSuccess(client: any, { job, duration }: any) {
    console.log(
      `worker: Async task ${job.id} (${job.task_identifier}) to be processed`
    );
  }
  async doWork(job: any) {
    const { payload, task_identifier } = job;
    if (!getJobSupportAny() && !this.supportedTaskNames.includes(task_identifier)) {
      throw new Error('Unsupported task');
    }
    await req(task_identifier, {
      body: payload,
      databaseId: job.database_id,
      workerId: this.workerId,
      jobId: job.id
    });
  }
  async doNext(client: any): Promise<void> {
    if (!this._initialized) {
      return await this.initialize(client);
    }
    console.log('worker: checking for jobs...');
    if (this.doNextTimer) clearTimeout(this.doNextTimer);
    this.doNextTimer = undefined;
    try {
      const job = await jobs.getJob(client, {
        workerId: this.workerId,
        supportedTaskNames: getJobSupportAny()
          ? null
          : this.supportedTaskNames
      });
      if (!job || !job.id) {
        this.doNextTimer = setTimeout(() => this.doNext(client), this.idleDelay as number);
        return;
      }
      const start = process.hrtime();
      let err;
      try {
        await this.doWork(job);
      } catch (error) {
        err = error;
      }
      const durationRaw = process.hrtime(start);
      const duration = ((durationRaw[0] * 1e9 + durationRaw[1]) / 1e6).toFixed(2);
      const jobId = job.id;
      try {
        if (err) {
          await this.handleError(client, { err, job, duration });
        } else {
          await this.handleSuccess(client, { job, duration });
        }
      } catch (fatalError) {
        await this.handleFatalError(client, { err, fatalError, jobId });
      }
      return this.doNext(client);
    } catch (err) {
      this.doNextTimer = setTimeout(() => this.doNext(client), this.idleDelay as number);
    }
  }
  listen() {
    const listenForChanges = (err: any, client: any, release: any) => {
      if (err) {
        console.error('worker: Error connecting with notify listener', err);
        setTimeout(this.listen.bind(this), 5000);
        return;
      }
      client.on('notification', () => {
        if (this.doNextTimer) {
          this.doNext(client);
        }
      });
      client.query('LISTEN "jobs:insert"');
      client.on('error', (e: any) => {
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
