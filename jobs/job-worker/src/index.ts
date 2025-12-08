import pg, { Pool, PoolClient } from 'pg';
import * as jobs from '@launchql/job-utils';
import poolManager from '@launchql/job-pg';
import type { JobRow } from '@launchql/core';
import { getJob as dbGetJob, completeJob as dbCompleteJob, failJob as dbFailJob } from '@launchql/core';
import { OpenFaasJobExecutor } from './executors/openfaas';
import { KnativeJobExecutor } from './executors/knative';

export type TaskHandler = (ctx: { pgPool: Pool; workerId: string }, job: JobRow) => Promise<void>;

export interface WorkerOptions {
  jobSchema?: string; // defaults to getJobSchema() inside utils
  queue?: string | null; // reserved for future use
  pollIntervalMs?: number; // default 15000
  workerId?: string; // default 'worker-0' or env HOSTNAME
  supportAny?: boolean; // when true, ignore task filters
  supported?: string[]; // explicit task identifiers
  callbackUrl?: string; // included in headers; executor may use it
}

export interface JobExecutor {
  execute(job: JobRow, headers: Record<string, string>): Promise<void>;
}

export class InlineExecutor implements JobExecutor {
  constructor(private tasks: Record<string, TaskHandler>) {}

  async execute(job: JobRow, _headers: Record<string, string>): Promise<void> {
    const handler = this.tasks[job.task_identifier];
    if (!handler) throw new Error('Unsupported task');
    // Context mirrors previous runtime
    await handler({ pgPool: this.pgPool!, workerId: this.workerId! } as any, job);
  }

  // The executor can be provided with context after Worker is constructed
  private pgPool?: Pool;
  private workerId?: string;
  bindRuntime(pgPool: Pool, workerId: string) {
    this.pgPool = pgPool;
    this.workerId = workerId;
  }
}

const pgPoolConfig = null; // deprecated, kept for constructor signature compatibility

function once(fn, context) {
  let result;
  return function () {
    if (fn) {
      result = fn.apply(context || this, arguments);
      fn = null;
    }
    return result;
  };
}

/* eslint-disable no-console */

export default class Worker {
  private pgPool: Pool;
  private executor: JobExecutor;
  private idleDelay: number;
  private workerId: string;
  private supportedTaskNames: string[];
  private supportAny: boolean;
  private jobSchema: string;
  private callbackUrl?: string;
  private doNextTimer: NodeJS.Timeout | undefined;
  private _ended = false;

  constructor({
    tasks,
    idleDelay = 15000,
    pgPool = poolManager.getPool(),
    workerId,
    jobSchema,
    pollIntervalMs,
    supportAny,
    supported,
    callbackUrl,
    executor,
  }: { tasks?: Record<string, TaskHandler>; executor?: JobExecutor } & WorkerOptions = {}) {
    // Resolve options from job-utils runtime for compatibility
    this.jobSchema = jobSchema ?? jobs.getJobSchema();
    this.supportAny = supportAny ?? jobs.getJobSupportAny();
    this.supportedTaskNames = supported ?? (tasks ? Object.keys(tasks) : jobs.getJobSupported());
    this.workerId = workerId ?? jobs.getWorkerHostname();
    this.idleDelay = pollIntervalMs ?? idleDelay ?? 15000;
    this.pgPool = pgPool;
    // Prefer neutral callback URL if set, otherwise fallback to existing OpenFaaS callback
    this.callbackUrl =
      callbackUrl ??
      jobs.getCallbackBaseUrl() ??
      jobs.getOpenFaasGatewayConfig().callbackUrl;

    // Choose executor: inline when tasks provided; otherwise:
    if (executor) {
      this.executor = executor;
    } else if (tasks) {
      const inline = new InlineExecutor(tasks);
      inline.bindRuntime(this.pgPool, this.workerId);
      this.executor = inline;
    } else {
      // Select executor via env toggle; default remains OpenFaaS
      const execName = (process.env.JOBS_EXECUTOR || '').toLowerCase();
      if (execName === 'knative') {
        this.executor = new KnativeJobExecutor();
      } else {
        this.executor = new OpenFaasJobExecutor();
      }
    }

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
    await jobs.failJob(client, {
      workerId: this.workerId,
      jobId: job.id,
      message: err.message
    });
  }
  async handleSuccess(client, { job, duration }) {
    console.log(
      `Completed task ${job.id} (${job.task_identifier}) with success (${duration}ms)`
    );
    await jobs.completeJob(client, { workerId: this.workerId, jobId: job.id });
  }
  async doWork(job: JobRow) {
    const headers: Record<string, string> = {
      'x-worker-id': this.workerId,
      'x-job-id': String(job.id),
      'x-database-id': job.database_id ?? '',
      // placeholder for future RLS user context
      'x-current-user-id': '',
      'x-callback-url': this.callbackUrl ?? '',
    };
    await this.executor.execute(job, headers);
  }
  async doNext(client: PoolClient) {
    this.doNextTimer = clearTimeout(this.doNextTimer);
    try {
      const job = await dbGetJob(this.pgPool as any, {
        workerId: this.workerId,
        supportedTaskNames: this.supportAny ? null : this.supportedTaskNames,
        schema: this.jobSchema,
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
    const listenForChanges = (err: Error | null, client: PoolClient, release: () => void) => {
      if (err) {
        console.error('Error connecting with notify listener', err);
        // Try again in 5 seconds
        // should this really be done in the node process?
        setTimeout(this.listen.bind(this), 5000);
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
