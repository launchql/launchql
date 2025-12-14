import { PgpmMigrate } from '@pgpmjs/core';
import { CLIOptions,Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { Pool } from 'pg';
import { getPgPool } from 'pg-cache';
import { getPgEnvOptions } from 'pg-env';

import { commands } from '../src/commands';
import { TestFixture } from './fixtures';
import { TestDatabase } from './TestDatabase';

export class CLIDeployTestFixture extends TestFixture {
  private databases: TestDatabase[] = [];
  private dbCounter = 0;
  private pools: Pool[] = [];

  constructor(...fixturePath: string[]) {
    super(...fixturePath);
  }


  async setupTestDatabase(): Promise<TestDatabase> {
    const dbName = `test_cli_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${this.dbCounter++}`;
    
    // Get base config from environment using pg-env
    const baseConfig = getPgEnvOptions({
      database: 'postgres'
    });
    
    // Create database using admin pool
    const adminPool = getPgPool(baseConfig);
    try {
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
    } catch (e) {
      if (e && typeof e === 'object' && 'errors' in e && Array.isArray((e as any).errors)) {
        for (const err of (e as any).errors) {
          console.error('AggregateError item:', err);
        }
      } else {
        console.error('Test failure:', e);
      }
      throw e;
    }
    
    // Get config for the new test database
    const pgConfig = getPgEnvOptions({
      database: dbName
    });
    
    const config = {
      host: pgConfig.host,
      port: pgConfig.port,
      user: pgConfig.user,
      password: pgConfig.password,
      database: pgConfig.database
    };

    // Initialize migrate schema
    const migrate = new PgpmMigrate(config);
    await migrate.initialize();

    // Get pool for test database operations
    const pool = getPgPool(pgConfig);
    this.pools.push(pool);

    const db: TestDatabase = {
      name: dbName,
      config,
      
      async query(sql: string, params?: any[]) {
        return pool.query(sql, params);
      },

      async exists(type: 'schema' | 'table', name: string) {
        if (type === 'schema') {
          const result = await pool.query(
            `SELECT EXISTS (
              SELECT 1 FROM information_schema.schemata 
              WHERE schema_name = $1
            ) as exists`,
            [name]
          );
          return result.rows[0].exists;
        } else {
          const [schema, table] = name.includes('.') ? name.split('.') : ['public', name];
          const result = await pool.query(
            `SELECT EXISTS (
              SELECT 1 FROM information_schema.tables 
              WHERE table_schema = $1 AND table_name = $2
            ) as exists`,
            [schema, table]
          );
          return result.rows[0].exists;
        }
      },

      async getDeployedChanges() {
        const result = await pool.query(
          `SELECT package, change_name, deployed_at 
           FROM pgpm_migrate.changes 
           ORDER BY deployed_at`
        );
        return result.rows;
      },

      async getMigrationState() {
        const changes = await pool.query(`
          SELECT package, change_name, script_hash, deployed_at
          FROM pgpm_migrate.changes 
          ORDER BY deployed_at
        `);
        
        const events = await pool.query(`
          SELECT package, change_name, event_type, occurred_at, error_message, error_code
          FROM pgpm_migrate.events 
          ORDER BY occurred_at
        `);
        
        const sanitizedEvents = events.rows;
        
        // Remove timestamps from objects for consistent snapshots
        const cleanChanges = changes.rows.map(({ deployed_at, ...change }) => change);
        const cleanEvents = sanitizedEvents.map(({ occurred_at, ...event }) => event);
        
        return {
          changes: cleanChanges,
          events: cleanEvents,
          changeCount: cleanChanges.length,
          eventCount: cleanEvents.length
        };
      },

      async getDependencies(packageName: string, changeName: string) {
        const result = await pool.query(
          `SELECT d.requires 
           FROM pgpm_migrate.dependencies d
           JOIN pgpm_migrate.changes c ON c.change_id = d.change_id
           WHERE c.package = $1 AND c.change_name = $2`,
          [packageName, changeName]
        );
        return result.rows.map((row: any) => row.requires);
      },

      async close() {
        // Don't close the pool here as it's managed by pg-cache
        // Just mark this database as closed
      }
    };

    this.databases.push(db);
    return db;
  }


  async exec(commandString: string, variables: Record<string, string> = {}): Promise<any[]> {
    return this.runTerminalCommands(commandString, variables, true);
  }

  async runTerminalCommands(commandString: string, variables: Record<string, string> = {}, executeCommands: boolean = true): Promise<any[]> {
    const results: any[] = [];
    let currentDir = this.tempFixtureDir;
    
    const commands = commandString
      .split(/\n|;/)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    for (const command of commands) {
      let processedCommand = command;
      for (const [key, value] of Object.entries(variables)) {
        processedCommand = processedCommand.replace(new RegExp(`\\$${key}`, 'g'), value);
      }
      
      const tokens = this.tokenizeCommand(processedCommand);
      
      if (tokens[0] === 'cd') {
        const targetDir = tokens[1];
        if (targetDir.startsWith('/')) {
          currentDir = targetDir;
        } else {
          currentDir = require('path').resolve(currentDir, targetDir);
        }
        results.push({ command: processedCommand, type: 'cd', result: { cwd: currentDir } });
      } else if (tokens[0] === 'lql' || tokens[0] === 'launchql') {
        // Handle LaunchQL CLI commands
        const argv = this.parseCliCommand(tokens.slice(1), currentDir);
        if (executeCommands) {
          const result = await this.runCliCommand(argv);
          results.push({ command: processedCommand, type: 'cli', result });
        } else {
          results.push({ command: processedCommand, type: 'cli', result: { argv } });
        }
      } else {
        throw new Error(`Unsupported command: ${tokens[0]}`);
      }
    }
    
    return results;
  }

  private tokenizeCommand(command: string): string[] {
    const re = /("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|--[a-zA-Z0-9_-]+|-[a-zA-Z0-9_]+|[^\s]+)|(\s+)/g;
    const matches = command.match(re);
    const tokens = matches ? matches.filter(t => t.trim()) : [];
    return tokens;
  }

  private parseCliCommand(tokens: string[], cwd: string): ParsedArgs {
    const argv: ParsedArgs = {
      _: [],
      cwd
    };
    
    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      
      if (token.startsWith('--')) {
        const key = token.substring(2);
        
        // Handle --no-<thing> pattern by setting <thing>: false
        if (key.startsWith('no-')) {
          const baseKey = key.substring(3); // Remove 'no-' prefix
          argv[baseKey] = false;
          i += 1;
        } else if (i + 1 < tokens.length && !tokens[i + 1].startsWith('--')) {
          argv[key] = tokens[i + 1];
          i += 2;
        } else {
          argv[key] = true;
          i += 1;
        }
      } else {
        argv._.push(token);
        i += 1;
      }
    }
    
    return argv;
  }

  private async runCliCommand(argv: ParsedArgs): Promise<any> {
    const prompter = new Inquirerer({
      input: process.stdin,
      output: process.stdout,
      noTty: true
    });

    const options: CLIOptions & { skipPgTeardown?: boolean } = {
      noTty: true,
      input: process.stdin,
      output: process.stdout,
      version: '1.0.0',
      skipPgTeardown: true,
      minimistOpts: {
        alias: {
          v: 'version',
          h: 'help'
        }
      }
    };

    await commands(argv, prompter, options);

    return { argv };
  }

  async cleanup(): Promise<void> {
    // Don't close pools here - let pg-cache manage them
    this.pools = [];
    this.databases = [];
    
    super.cleanup();
  }
}
