import env from './env';
import pg from 'pg';
import * as jobs from '@launchql/job-utils';

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pgPoolConfig = {
  connectionString: getDbString()
};

function once(fn: (...args: any[]) => any, context?: any) {
  let result: any;
  return function (this: any, ...args: any[]) {
    if (fn) {
      result = fn.apply(context || this, args);
      fn = null as any;
    }
    return result;
  };
}

/* eslint-disable no-console */

export default class Worker {
  tasks: Record<string, any>;
  idleDelay: number;
  supportedTaskNames: string[];
  workerId: string;
  doNextTimer: any;
  pgPool: any;
  _ended?: boolean;

  constructor({
    tasks,
    idleDelay = 15000,
    pgPool = new (pg as any).Pool(pgPoolConfig),
    workerId = 'worker-0'
  }: any) {
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
    err?: any;
    fatalError: any;
    jobId: any;
  }) {
    const when = err ? `after failure '${err.message}'` : 'after success';
    console.error(
      `Failed to release job '${jobId}' ${when}; committing seppuku`
    );
    console.error(fatalError);
    process.exit(1);
  }
  async handleError(
    client: any,
    { err, job, duration }: { err: any; job: any; duration: any }
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
    client: any,
    { job, duration }: { job: any; duration: any }
  ) {
    console.log(
      `Completed task ${job.id} (${job.task_identifier}) with success (${duration}ms)`
    );
    await jobs.completeJob(client, { workerId: this.workerId, jobId: job.id });
  }
  async doWork(job: any) {
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
  async doNext(client: any): Promise<void> {
    this.doNextTimer = clearTimeout(this.doNextTimer);
    try {
      const job = await jobs.getJob(client, {
        workerId: this.workerId,
        supportedTaskNames: this.supportedTaskNames
      });
      if (!job || !job.id) {
        this.doNextTimer = setTimeout(
          () => this.doNext(client),
          this.idleDelay
        );
        return;
      }
      const start = process.hrtime();

      let err: any;
      try {
        await this.doWork(job);
      } catch (error) {
        err = error;
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
      } catch (fatalError: any) {
        this.handleFatalError({ err, fatalError, jobId });
      }
      return this.doNext(client);
    } catch (err) {
      this.doNextTimer = setTimeout(() => this.doNext(client), this.idleDelay);
    }
  }
  listen() {
    const listenForChanges = (err: any, client: any, release: any) => {
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
      client.on('error', (e: any) => {
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
