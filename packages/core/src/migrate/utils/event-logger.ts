import { Logger } from '@launchql/logger';
import { Pool } from 'pg';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';

const log = new Logger('migrate:event-logger');

export interface EventLogEntry {
  eventType: 'deploy' | 'revert' | 'verify';
  changeName: string;
  project: string;
  errorMessage?: string;
  errorCode?: string;
  stackTrace?: string;
}

export class EventLogger {
  private pool: Pool;

  constructor(config: PgConfig) {
    this.pool = getPgPool(config);
  }


  async logEvent(entry: EventLogEntry): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO launchql_migrate.events 
        (event_type, change_name, project, error_message, error_code, stack_trace)
        VALUES ($1::TEXT, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT, $6::TEXT)
      `, [
        entry.eventType,
        entry.changeName,
        entry.project,
        entry.errorMessage || null,
        entry.errorCode || null,
        entry.stackTrace || null
      ]);
      
      log.debug(`Logged ${entry.eventType} event for ${entry.project}:${entry.changeName}`);
    } catch (error: any) {
      log.error(`Failed to log event: ${error.message}`);
    }
  }
}
