#!/usr/bin/env node

import Worker from './index';
import env from './env';
import poolManager from '@launchql/job-pg';

const pgPool = poolManager.getPool();

const worker = new Worker({
  pgPool,
  workerId: env.HOSTNAME,
  tasks: env.SUPPORTED_JOBS
});

worker.listen();
