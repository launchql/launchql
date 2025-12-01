#!/usr/bin/env node

import Scheduler from '@launchql/job-scheduler';
import Worker from '@launchql/openfaas-job-worker';
import server from '@launchql/openfaas-job-server';
import poolManager from '@launchql/job-pg';
import pg from 'pg';
import retry from 'async-retry';
import {
  getJobPgConfig,
  getJobSchema,
  getWorkerHostname,
  getJobSupported,
  getOpenFaasGatewayConfig,
} from '@launchql/job-utils';

const start = () => {
  console.log('starting jobs services...');
  const pgPool = poolManager.getPool();
  const { callbackPort } = getOpenFaasGatewayConfig();
  server(pgPool).listen(callbackPort, () => {
    console.log(`[cb] listening ON ${callbackPort}`);

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
  let pgClient;
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
    // process.stderr.write(e.message);
    console.log(e);
  } finally {
    pgClient.end();
  }
  if (failed === 1) {
    throw new Error('jobs server boot failed...');
    // process.exit(failed);
  } else {
    start();
  }
};

const boot = async () => {
  console.log('attempting to boot jobs');
  await retry(
    async (bail) => {
      await wait();
    },
    {
      retries: 10,
      factor: 2
    }
  );
};

boot();
