import env from './env';
import * as jobs from '@launchql/job-utils';
import type { PgClientLike } from '@launchql/job-utils';
import schedule from 'node-schedule';
import poolManager from '@launchql/job-pg';
import type { Pool, PoolClient } from 'pg';

/* eslint-disable no-console */

export interface ScheduledJobRow {
  id: number | string;
  task_identifier: string;
  schedule_info: unknown;
}

interface SchedulerJobHandle {
  cancel(): void;
}

export default class Scheduler {
  idleDelay: number;
  supportedTaskNames: string[];
  workerId: string;
  doNextTimer?: NodeJS.Timeout;
  pgPool: Pool;
  jobs: Record<ScheduledJobRow['id'], SchedulerJobHandle>;
  _initialized?: boolean;

  constructor({
    tasks,
    idleDelay = 15000,
    pgPool = poolManager.getPool(),
    workerId = 'scheduler-0'
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
    this.jobs = {};
    poolManager.onClose(async () => {
      await jobs.releaseScheduledJobs(pgPool, {
        workerId: this.workerId,
        // When ids is omitted the DB function releases all scheduled jobs
        ids: undefined as unknown as Array<number | string>
      });
    });
  }
  async initialize(client: PgClientLike) {
    if (this._initialized === true) return;
    await jobs.releaseScheduledJobs(client, {
      workerId: this.workerId,
      // When ids is omitted the DB function releases all scheduled jobs
      ids: undefined as unknown as Array<number | string>
    });
    this._initialized = true;
    await this.doNext(client);
  }
  async handleFatalError(
    client: PgClientLike,
    {
      err,
      fatalError,
      jobId
    }: { err?: Error; fatalError: unknown; jobId: ScheduledJobRow['id'] }
  ) {
    const when = err ? `after failure '${err.message}'` : 'after success';
    console.error(
      `Failed to release job '${jobId}' ${when}; committing seppuku`
    );
    console.error(fatalError);
    await poolManager.close();
    process.exit(1);
  }
  async handleError(
    client: PgClientLike,
    {
      err,
      job,
      duration
    }: { err: Error; job: ScheduledJobRow; duration: string }
  ) {
    console.error(
      `scheduler: Failed to initialize scheduler for ${job.id} (${job.task_identifier}) with error ${err.message} (${duration}ms)`,
      { err, stack: err.stack }
    );
    const j = this.jobs[job.id];
    if (j) j.cancel();
    await jobs.releaseScheduledJobs(client, {
      workerId: this.workerId,
      ids: [job.id]
    });
  }
  async handleSuccess(
    client: PgClientLike,
    { job, duration }: { job: ScheduledJobRow; duration: string }
  ) {
    console.log(
      `scheduler: initialized ${job.id} (${job.task_identifier}) with success (${duration}ms)`
    );
  }
  async scheduleJob(client: PgClientLike, job: ScheduledJobRow) {
    const { id, task_identifier, schedule_info } = job;
    const j = schedule.scheduleJob(schedule_info as never, async () => {
      const newjob = (await jobs.runScheduledJob(client, {
        jobId: id
      })) as ScheduledJobRow | null;

      if (newjob) {
        if (newjob.id) {
          console.log(`spinning up job[${newjob.task_identifier}]`);
        } else {
          // this means the scheduled_job has been deleted from db, so cancel it
          console.log(
            `scheduler: attempted job[${job.task_identifier}] but it's probably non existent, unscheduling...`
          );
          const scheduledJob = this.jobs[job.id];
          if (scheduledJob) scheduledJob.cancel();
        }
      } else {
        console.log(
          `scheduler: job already scheduled but not yet run or complete: [${job.task_identifier}]`
        );
      }
    });
    this.jobs[id] = j as SchedulerJobHandle;
  }
  async doNext(client: PgClientLike): Promise<void> {
    if (!this._initialized) {
      return await this.initialize(client);
    }

    if (this.doNextTimer) {
      clearTimeout(this.doNextTimer);
      this.doNextTimer = undefined;
    }
    try {
      const job = await jobs.getScheduledJob<ScheduledJobRow>(client, {
        workerId: this.workerId,
        supportedTaskNames: env.JOBS_SUPPORT_ANY
          ? null
          : this.supportedTaskNames
      });
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
        await this.scheduleJob(client, job);
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
        console.error('scheduler: Error connecting with notify listener', err);
        // Try again in 5 seconds
        // should this really be done in the node process?
        setTimeout(this.listen, 5000);
        return;
      }
      client.on('notification', () => {
        console.log('scheduler: a NEW scheduled JOB!');
        if (this.doNextTimer) {
          // Must be idle, do something!
          this.doNext(client);
        }
      });
      client.query('LISTEN "scheduled_jobs:insert"');
      client.on('error', (e: unknown) => {
        console.error('scheduler: Error with database notify listener', e);
        release();
        this.listen();
      });
      console.log(
        `scheduler: ${this.workerId} connected and looking for scheduled jobs...`
      );
      this.doNext(client);
    };
    this.pgPool.connect(listenForChanges);
  }
}

export { Scheduler };
