import { fn, sqlfile, compose } from './adapters';
import { csv } from './csv';
import { json } from './json';
import { sqitch } from './sqitch';
import { launchql } from './launchql';
export * from './types';

export const seed = {
  launchql,
  sqitch,
  json,
  csv,
  compose,
  fn,
  sqlfile
};