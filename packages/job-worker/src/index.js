import env from './env';
import pg from 'pg';
import * as jobs from '@launchql/job-utils';
import crypto from 'crypto';

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pgPoolConfig = {
  connectionString: getDbString()
};

/* eslint-disable no-console */

export default class Worker {
  constructor({ tasks, idleDelay = 15000 }) {
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
    this.workerId = `worker-${crypto.randomBytes(20).toString('hex')}`;
    this.doNextTimer = undefined;
    this.pgPool = new pg.Pool(pgPoolConfig);
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
  handleFatalError({ err, fatalError, jobId }) {
    const when = err ? `after failure '${err.message}'` : 'after success';
    console.error(
      `Failed to release job '${jobId}' ${when}; committing seppuku`
    );
    console.error(fatalError);
    process.exit(1);
  }
  async handleError(client, { err, job, duration }) {
    console.error(
      `Failed task ${job.id} (${job.task_identifier}) with error ${err.message} (${duration}ms)`,
      { err, stack: err.stack }
    );
    console.error(err.stack);
    await jobs.fail(client, {
      workerId: this.workerId,
      jobId: job.id,
      message: err.message
    });
  }
  async handleSuccess(client, { job, duration }) {
    console.log(
      `Completed task ${job.id} (${job.task_identifier}) with success (${duration}ms)`
    );
    await jobs.complete(client, { workerId: this.workerId, jobId: job.id });
  }
  async doWork(job) {
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
  async doNext(client) {
    this.doNextTimer = clearTimeout(this.doNextTimer);
    try {
      const job = await jobs.get(client, {
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

      let err;
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
      } catch (fatalError) {
        this.handleFatalError({ err, fatalError, jobId });
      }
      return this.doNext(client);
    } catch (err) {
      this.doNextTimer = setTimeout(() => this.doNext(client), this.idleDelay);
    }
  }
  listen() {
    const listenForChanges = (err, client, release) => {
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
      client.on('error', (e) => {
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
