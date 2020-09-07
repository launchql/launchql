#!/usr/bin/env node

import Scheduler from './index';
import env from './env';
import poolManager from '@launchql/job-pg';

const pgPool = poolManager.getPool();

const scheduler = new Scheduler({
  pgPool,
  workerId: env.HOSTNAME,
  tasks: env.JOBS_SUPPORTED
});

scheduler.listen();
