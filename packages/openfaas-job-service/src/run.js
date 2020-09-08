#!/usr/bin/env node

import env from './env';
import Scheduler from '@launchql/job-scheduler';
import Worker from '@launchql/openfaas-job-worker';
import server from '@launchql/openfaas-job-server';
import api from '@launchql/job-api-server';
import poolManager from '@launchql/job-pg';
import pg from 'pg';
import retry from 'async-retry';

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;
const start = () => {
  console.log('starting jobs services...');
  const pgPool = poolManager.getPool();
  api(pgPool).listen(env.INTERNAL_JOBS_API_PORT, () => {
    console.log(`[api] listening ON ${env.INTERNAL_JOBS_API_PORT}`);
    server(pgPool).listen(env.INTERNAL_JOBS_CALLBACK_PORT, () => {
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
  });
};

const wait = async () => {
  console.log('waiting for jobs prereqs');
  let failed = 0;
  let pgClient;
  try {
    pgClient = new pg.Client(getDbString());
    await pgClient.connect();
    await pgClient.query(`SELECT * FROM "${env.JOBS_SCHEMA}".jobs LIMIT 1;`);
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
