#!/usr/bin/env node

import Scheduler from '@launchql/job-scheduler';
import Worker from '@launchql/knative-job-worker';
import poolManager from '@launchql/job-pg';
import pg from 'pg';
import retry from 'async-retry';
import {
  getJobPgConfig,
  getJobSchema,
  getWorkerHostname,
  getJobSupported,
  getJobsCallbackPort,
} from '@launchql/job-utils';
import { createCallbackServer } from '@launchql/job-callback/src/server';

const start = () => {
  console.log('starting knative jobs services...');
  const pgPool = poolManager.getPool();
  const callbackPort = getJobsCallbackPort();
  createCallbackServer().listen(callbackPort, () => {
    console.log(`[cb] listening on ${callbackPort}`);

    const worker = new Worker({
      pgPool,
      workerId: getWorkerHostname(),
      tasks: getJobSupported()
    });

    const scheduler = new Scheduler({
      pgPool,
      workerId: getWorkerHostname(),
      tasks: getJobSupported()
    });

    worker.listen();
    scheduler.listen();
  });
};

const wait = async () => {
  console.log('waiting for jobs prereqs');
  let failed = 0;
  let pgClient: pg.Client | undefined;
  try {
    const cfg = getJobPgConfig();
    pgClient = new pg.Client({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
    });
    await pgClient.connect();
    const schema = getJobSchema();
    await pgClient.query(`SELECT * FROM "${schema}".jobs LIMIT 1;`);
  } catch (e) {
    failed = 1;
    console.log(e);
  } finally {
    if (pgClient) pgClient.end();
  }
  if (failed === 1) {
    throw new Error('jobs server boot failed...');
  } else {
    start();
  }
};

const boot = async () => {
  console.log('attempting to boot knative jobs');
  await retry(
    async () => {
      await wait();
    },
    {
      retries: 10,
      factor: 2
    }
  );
};

boot();

