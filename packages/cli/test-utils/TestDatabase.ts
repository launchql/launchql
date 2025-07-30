import { PgConfig } from 'pg-env';

export interface TestDatabase {
  name: string;
  config: PgConfig;
  
  query(sql: string, params?: any[]): Promise<any>;
  exists(type: 'schema' | 'table', name: string): Promise<boolean>;
  getDeployedChanges(): Promise<any[]>;
  getMigrationState(): Promise<{
    changes: any[];
    events: any[];
    changeCount: number;
    eventCount: number;
  }>;
  getDependencies(packageName: string, changeName: string): Promise<string[]>;
  close(): Promise<void>;
}
