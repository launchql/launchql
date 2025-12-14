import { Logger } from '@pgpmjs/logger';
import { LRUCache } from 'lru-cache';

const log = new Logger('pg-cache');

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR_IN_MS * 24;
const ONE_YEAR = ONE_DAY * 366;

// --- Service Cache ---
export const svcCache = new LRUCache<string, any>({
  max: 25,
  ttl: ONE_YEAR,
  updateAgeOnGet: true,
  dispose: (_, key) => {
    log.debug(`Disposing service[${key}]`);
  }
});