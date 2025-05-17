import { PgTestClient } from './test-client';
import { PgTestConnector } from './manager';
import { randomUUID } from 'crypto';
import { getPgEnvOptions, PgConfig } from '@launchql/types';

export function connect(config: PgConfig): PgTestClient {
  const manager = PgTestConnector.getInstance();
  return manager.getClient(config);
}

export function close(client: PgTestClient): void {
  client.close();
}

const manager = PgTestConnector.getInstance();

export const Connection = {
  connect(config: Partial<PgConfig>): PgTestClient {
    const creds = getPgEnvOptions(config);
    return manager.getClient(creds);
  },

  close(client: PgTestClient): void {
    client.close();
  },

  closeAll(): Promise<void> {
    return manager.closeAll();
  },

  getManager(): PgTestConnector {
    return manager;
  }
};
