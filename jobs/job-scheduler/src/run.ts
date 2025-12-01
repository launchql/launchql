#!/usr/bin/env node

import Scheduler from './index';
import poolManager from '@launchql/job-pg';
import { getSchedulerHostname, getJobSupported } from '@launchql/job-utils';

const pgPool = poolManager.getPool();

const scheduler = new Scheduler({
  pgPool,
  workerId: getSchedulerHostname(),
  tasks: getJobSupported()
});

scheduler.listen();
