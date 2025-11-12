import { sqlfile, fn, compose } from './adapters';
import { launchql } from './launchql';

export { loadCsvMap, copyCsvIntoTable, exportTableToCsv } from './csv';
export type { CsvSeedMap } from './csv';
export { insertJson } from './json';
export type { JsonSeedMap } from './json';
export { sqlfile, fn, compose } from './adapters';
export { launchql } from './launchql';
export type { SeedAdapter, SeedContext } from './types';

export const seed = {
  sqlfile,
  fn,
  compose,
  launchql
};
