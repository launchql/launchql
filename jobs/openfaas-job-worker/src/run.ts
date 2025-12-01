#!/usr/bin/env node

import Worker from './index';
import poolManager from '@launchql/job-pg';
import { getWorkerHostname, getJobSupported } from '@launchql/job-utils';

const pgPool = poolManager.getPool();

const worker = new Worker({
  pgPool,
  workerId: getWorkerHostname(),
  tasks: getJobSupported()
});

worker.listen();
