import { PgConfig } from './types';
import { PgWrapper } from './wrapper';

export function connect(config: PgConfig): PgWrapper {
  const db = new PgWrapper(config);
  return db;
}

export function close(client: PgWrapper): void {
  client.close();
}
