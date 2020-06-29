#!/usr/bin/env node

import { TestDatabase } from '../lib/@launchql/db-test';
import { dropdb } from '../lib/db';
import { getOpts } from '../lib/testing';

if (!process.env.PGTEMPLATE_DATABASE) {
  require('dotenv').load();
  if (!process.env.PGTEMPLATE_DATABASE) {
    throw new Error('no PGTEMPLATE_DATABASE defined in env!');
  }
}

let extensions = process.env.PGEXTENSIONS;
extensions = extensions.split(',');

const run = async () => {
  const config = await getOpts({});
  try {
    await dropdb({ ...config, database: process.env.PGTEMPLATE_DATABASE });
  } catch (e) {}
  const test = new TestDatabase();
  await test.init(extensions);
};

run();
