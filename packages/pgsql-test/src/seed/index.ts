import { compose,fn, sqlfile } from './adapters';
import { csv } from './csv';
import { json } from './json';
import { launchql } from './launchql';
import { sqitch } from './sqitch';
export * from './csv';
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