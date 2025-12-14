import { Logger } from '@pgpmjs/logger';
import { Pool } from 'pg';
import { getPgPool } from 'pg-cache';
import { PgConfig } from 'pg-env';

const log = new Logger('migrate:event-logger');

export interface EventLogEntry {
  eventType: 'deploy' | 'revert' | 'verify';
  changeName: string;
  package: string;
  errorMessage?: string;
  errorCode?: string;
}

export class EventLogger {
  private pool: Pool;

  constructor(config: PgConfig) {
    this.pool = getPgPool(config);
  }


  async logEvent(entry: EventLogEntry): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO pgpm_migrate.events 
        (event_type, change_name, package, error_message, error_code)
        VALUES ($1::TEXT, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT)
      `, [
        entry.eventType,
        entry.changeName,
        entry.package,
        entry.errorMessage || null,
        entry.errorCode || null
      ]);
      
      log.debug(`Logged ${entry.eventType} event for ${entry.package}:${entry.changeName}`);
    } catch (error: any) {
      log.error(`Failed to log event: ${error.message}`);
    }
  }
}
