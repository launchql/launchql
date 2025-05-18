import { fn, sqlfile, compose } from './adapters';
import { csv } from './csv';
import { json } from './json';
export * from './types';

export const seed = {
  json,
  csv,
  compose,
  fn,
  sqlfile
};