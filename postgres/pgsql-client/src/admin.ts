import { 
  generateCreateUserWithGrantsSQL, 
  generateGrantRoleSQL
} from '@pgpmjs/core';
import { Logger } from '@pgpmjs/logger';
import { PgTestConnectionOptions } from '@pgpmjs/types';
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { getPgEnvOptions, PgConfig } from 'pg-env';

import { getRoleName } from './roles';
import { streamSql as stream } from './stream';

const log = new Logger('db-admin');

const sqlLiteral = (value: string): string => `'${value.replace(/'/g, "''")}'`;

const quoteIdentifier = (value: string): string =>
  `"${value.replace(/"/g, '""')}"`;

export class DbAdmin {
  protected config: PgConfig;
  protected verbose: boolean;
  protected roleConfig?: PgTestConnectionOptions;

  constructor(
    config: PgConfig,
    verbose: boolean = false,
    roleConfig?: PgTestConnectionOptions
  ) {
    this.config = getPgEnvOptions(config);
    this.verbose = verbose;
    this.roleConfig = roleConfig;
  }

  private connectionArgs(): string[] {
    return [
      '-U',
      this.config.user,
      '-h',
      this.config.host,
      '-p',
      String(this.config.port)
    ];
  }

  private getEnv(): Record<string, string> {
    return {
      PGHOST: this.config.host,
      PGPORT: String(this.config.port),
      PGUSER: this.config.user,
      PGPASSWORD: this.config.password
    };
  }

  private run(file: string, args: string[]): void {
    const command = [file, ...args].join(' ');
    try {
      execFileSync(file, args, {
        stdio: this.verbose ? 'inherit' : 'pipe',
        env: {
          ...process.env,
          ...this.getEnv()
        }
      });
      if (this.verbose) log.success(`Executed: ${command}`);
    } catch (err: any) {
      log.error(`Command failed: ${command}`);
      if (this.verbose) log.error(err.message);
      throw err;
    }
  }

  private safeDropDb(name: string): void {
    try {
      this.run('dropdb', [name]);
    } catch (err: any) {
      if (err.message.includes('does not exist')) {
        return;
      }
      if (err.message.includes('is being accessed by other users')) {
        log.warn(`Database ${name} has active sessions, terminating backends and retrying drop...`);
        try {
          this.run('psql', [
            '-c',
            `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${sqlLiteral(name)} AND pid <> pg_backend_pid();`
          ]);
          this.run('dropdb', [name]);
        } catch (retryErr: any) {
          log.warn(`Could not drop database ${name} after terminating backends: ${retryErr.message}`);
        }
        return;
      }
      log.warn(`Could not drop database ${name}: ${err.message}`);
    }
  }

  drop(dbName?: string): void {
    this.safeDropDb(dbName ?? this.config.database);
  }

  dropTemplate(dbName: string): void {
    this.run('psql', [
      '-c',
      `UPDATE pg_database SET datistemplate='false' WHERE datname=${sqlLiteral(dbName)}`
    ]);
    this.drop(dbName);
  }

  create(dbName?: string): void {
    const db = dbName ?? this.config.database;
    this.run('createdb', [...this.connectionArgs(), db]);
  }

  createFromTemplate(template: string, dbName?: string): void {
    const db = dbName ?? this.config.database;
    this.run('createdb', [...this.connectionArgs(), '-e', '-T', template, db]);
  }

  installExtensions(extensions: string[] | string, dbName?: string): void {
    const db = dbName ?? this.config.database;
    const extList = typeof extensions === 'string' ? extensions.split(',') : extensions;

    for (const extension of extList) {
      this.run('psql', [
        '--dbname',
        db,
        '-c',
        `CREATE EXTENSION IF NOT EXISTS ${quoteIdentifier(extension)} CASCADE;`
      ]);
    }
  }

  connectionString(dbName?: string): string {
    const { user, password, host, port } = this.config;
    const db = dbName ?? this.config.database;
    return `postgres://${user}:${password}@${host}:${port}/${db}`;
  }

  createTemplateFromBase(base: string, template: string): void {
    this.run('createdb', ['-T', base, template]);
    this.run('psql', [
      '-c',
      `UPDATE pg_database SET datistemplate = true WHERE datname = ${sqlLiteral(template)};`
    ]);
  }

  cleanupTemplate(template: string): void {
    try {
      this.run('psql', [
        '-c',
        `UPDATE pg_database SET datistemplate = false WHERE datname = ${sqlLiteral(template)}`
      ]);
    } catch {
      log.warn(`Skipping failed UPDATE of datistemplate for ${template}`);
    }
    this.safeDropDb(template);
  }
  
  async grantRole(role: string, user: string, dbName?: string): Promise<void> {
    const db = dbName ?? this.config.database;
    const sql = generateGrantRoleSQL(role, user);
    await this.streamSql(sql, db);
  }

  async grantConnect(role: string, dbName?: string): Promise<void> {
    const db = dbName ?? this.config.database;
    const sql = `GRANT CONNECT ON DATABASE "${db}" TO ${role};`;
    await this.streamSql(sql, db);
  }

  // ONLY granting admin role for testing purposes, normally the db connection for apps won't have admin role
  // DO NOT USE THIS FOR PRODUCTION
  async createUserRole(user: string, password: string, dbName: string, useLocksForRoles = false): Promise<void> {
    const anonRole = getRoleName('anonymous', this.roleConfig);
    const authRole = getRoleName('authenticated', this.roleConfig);
    const adminRole = getRoleName('administrator', this.roleConfig);
    
    const sql = generateCreateUserWithGrantsSQL(
      user, 
      password, 
      [anonRole, authRole, adminRole],
      useLocksForRoles
    );

    await this.streamSql(sql, dbName);
  }

  loadSql(file: string, dbName: string): void {
    if (!existsSync(file)) {
      throw new Error(`Missing SQL file: ${file}`);
    }
    try {
      execFileSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-f', file, dbName], {
        stdio: 'pipe',
        env: { ...process.env, ...this.getEnv() }
      });
    } catch (err: any) {
      const detail = String(err.stderr ?? '').trim() || err.message;
      throw new Error(`SQL file ${file} failed: ${detail}`, { cause: err });
    }
  }

  async streamSql(sql: string, dbName: string): Promise<void> {
    await stream(
      {
        ...this.config,
        database: dbName
      },
      sql
    );
  }
}
