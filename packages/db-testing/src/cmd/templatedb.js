#!/usr/bin/env node

import { TestDatabase } from '../lib/test-db';
import { dropdb } from '../lib/db';
import { getOpts } from '../lib/testing';
import { controlPath } from '@launchql/db-utils';
import env from '../env';

if (!env.PGTEMPLATE_DATABASE) {
  throw new Error('no PGTEMPLATE_DATABASE defined in env!');
}

const run = async () => {
  const control = await controlPath();
  let extensions = env.PGEXTENSIONS;
  if (!extensions) {
    console.log(control);
    console.log(process.cwd());
    throw new Error('extensions not found');
  }
  extensions = extensions.split(',');

  const config = await getOpts({});
  try {
    await dropdb({ ...config, database: env.PGTEMPLATE_DATABASE });
  } catch (e) {}
  const test = new TestDatabase();
  await test.init(extensions);
};

run();
