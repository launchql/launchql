import { MigrateConfig } from '../src/migrate/types';

export interface TestDatabase {
  name: string;
  config: MigrateConfig;
  query(sql: string, params?: any[]): Promise<any>;
  exists(type: 'schema' | 'table', name: string): Promise<boolean>;
  getDeployedChanges(): Promise<any[]>;
  getDependencies(project: string, changeName: string): Promise<string[]>;
  close(): Promise<void>;
}
