import { fn, sqlfile, compose } from './adapters';
import { csv } from './csv';
export * from './types';

export const seed = {
  csv,
  compose,
  fn,
  sqlfile
};