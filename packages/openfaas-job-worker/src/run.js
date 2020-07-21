#!/usr/bin/env node

import Worker from './index';
import env from './env';

const worker = new Worker({
  tasks: env.SUPPORTED_JOBS
});

worker.listen();
