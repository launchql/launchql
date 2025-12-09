#!/usr/bin/env node

import env from './env';
import Scheduler from '@launchql/job-scheduler';
import Worker from '@launchql/knative-job-worker';
import server from '@launchql/knative-job-server';
import poolManager from '@launchql/job-pg';
import pg from 'pg';
import retry from 'async-retry';

export const getDbConnectionString = (): string =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

export const startJobsServices = () => {
  console.log('starting jobs services...');
  const pgPool = poolManager.getPool();
  const app = server(pgPool);

  const httpServer = app.listen(env.INTERNAL_JOBS_CALLBACK_PORT, () => {
    console.log(`[cb] listening ON ${env.INTERNAL_JOBS_CALLBACK_PORT}`);

    const worker = new Worker({
      pgPool,
      workerId: env.HOSTNAME,
      tasks: env.JOBS_SUPPORTED
    });

    const scheduler = new Scheduler({
      pgPool,
      workerId: env.HOSTNAME,
      tasks: env.JOBS_SUPPORTED
    });

    worker.listen();
    scheduler.listen();
  });

  return { pgPool, httpServer };
};

export const waitForJobsPrereqs = async (): Promise<void> => {
  console.log('waiting for jobs prereqs');
  let client: any = null;
  try {
    client = new pg.Client(getDbConnectionString());
    await client.connect();
    await client.query(`SELECT * FROM "${env.JOBS_SCHEMA}".jobs LIMIT 1;`);
  } catch (error) {
    console.log(error);
    throw new Error('jobs server boot failed...');
  } finally {
    if (client) {
      client.end();
    }
  }
};

export const bootJobs = async (): Promise<void> => {
  console.log('attempting to boot jobs');
  await retry(
    async () => {
      await waitForJobsPrereqs();
    },
    {
      retries: 10,
      factor: 2
    }
  );
  startJobsServices();
};

if (require.main === module) {
  void bootJobs();
}
