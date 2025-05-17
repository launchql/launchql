import { execSync } from 'child_process';
import { PgConfig } from '@launchql/types';
import { existsSync } from 'fs';
import { streamSql as stream } from './stream';
import { randomUUID } from 'crypto';

export interface SeedAdapter {
  seed(db: DbAdmin, dbName: string): Promise<void> | void;
}

export function sqlFileSeedAdapter(files: string[]): SeedAdapter {
  return {
    seed(db, dbName) {
      for (const file of files) {
        db.loadSql(file, dbName);
      }
    }
  };
}

export function programmaticSeedAdapter(
  fn: (db: DbAdmin, dbName: string) => Promise<void>
): SeedAdapter {
  return {
    seed: fn
  };
}

export function compositeSeedAdapter(adapters: SeedAdapter[]): SeedAdapter {
  return {
    async seed(db, dbName) {
      for (const adapter of adapters) {
        await adapter.seed(db, dbName);
      }
    }
  };
}


export class DbAdmin {
  constructor(
    private config: PgConfig,
    private verbose: boolean = false
  ) { }

  private getEnv(): Record<string, string> {
    return {
      PGHOST: this.config.host,
      PGPORT: String(this.config.port),
      PGUSER: this.config.user,
      PGPASSWORD: this.config.password,
    };
  }

  private run(command: string): void {
    execSync(command, {
      stdio: this.verbose ? 'inherit' : 'pipe',
      env: {
        ...process.env,
        ...this.getEnv(),
      },
    });
  }

  private safeDropDb(name: string): void {
    try {
      this.run(`dropdb "${name}"`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('does not exist')) {
        console.warn(`⚠️  Could not drop database ${name}: ${message}`);
      }
    }
  }

  drop(dbName?: string): void {
    this.safeDropDb(dbName ?? this.config.database);
  }

  dropTemplate(dbName: string): void {
    this.run(`psql -c "UPDATE pg_database SET datistemplate='false' WHERE datname='${dbName}';"`);
    this.drop(dbName);
  }

  create(dbName?: string): void {
    const db = dbName ?? this.config.database;
    this.run(`createdb -U ${this.config.user} -h ${this.config.host} -p ${this.config.port} "${db}"`);
  }

  createFromTemplate(template: string, dbName?: string): void {
    const db = dbName ?? this.config.database;
    this.run(`createdb -U ${this.config.user} -h ${this.config.host} -p ${this.config.port} -e "${db}" -T "${template}"`);
  }

  installExtensions(extensions: string[] | string, dbName?: string): void {
    const db = dbName ?? this.config.database;
    const extList = typeof extensions === 'string' ? extensions.split(',') : extensions;

    for (const extension of extList) {
      this.run(`psql --dbname "${db}" -c 'CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;'`);
    }
  }

  connectionString(dbName?: string): string {
    const { user, password, host, port } = this.config;
    const db = dbName ?? this.config.database;
    return `postgres://${user}:${password}@${host}:${port}/${db}`;
  }

  createTemplateFromBase(base: string, template: string): void {
    this.run(`createdb -T "${base}" "${template}"`);
    this.run(`psql -c "UPDATE pg_database SET datistemplate = true WHERE datname = '${template}';"`);
  }

  cleanupTemplate(template: string): void {
    try {
      this.run(`psql -c "UPDATE pg_database SET datistemplate = false WHERE datname = '${template}'"`);
    } catch { }
    this.safeDropDb(template);
  }

  async createRole(role: string, password: string, dbName?: string): Promise<void> {
    const db = dbName ?? this.config.database;
    const sql = `CREATE ROLE ${role} WITH LOGIN PASSWORD '${password}';`;
    await this.streamSql(sql, db);
  }
  
  async grantRole(role: string, user: string, dbName?: string): Promise<void> {
    const db = dbName ?? this.config.database;
    const sql = `GRANT ${role} TO ${user};`;
    await this.streamSql(sql, db);
  }
  
  async grantConnect(role: string, dbName?: string): Promise<void> {
    const db = dbName ?? this.config.database;
    const sql = `GRANT CONNECT ON DATABASE "${db}" TO ${role};`;
    await this.streamSql(sql, db);
  }
  
  async createUserRole(user: string, password: string, dbName: string): Promise<void> {
    const sql = `
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${user}') THEN
      CREATE ROLE ${user} LOGIN PASSWORD '${password}';
      GRANT anonymous TO ${user};
      GRANT authenticated TO ${user};
    END IF;
  END $$;
    `.trim();

    this.streamSql(sql, dbName);
  }

  loadSql(file: string, dbName: string): void {
    if (!existsSync(file)) {
      throw new Error(`Missing SQL file: ${file}`);
    }
    this.run(`psql -f ${file} ${dbName}`);
  }

  async streamSql(sql: string, dbName: string): Promise<void> {
    await stream({
      ...this.config,
      database: dbName
    }, sql);
  }  

  async createSeededTemplate(templateName: string, adapter: SeedAdapter): Promise<void> {
    const seedDb = this.config.database;
    this.create(seedDb);
    await adapter.seed(this, seedDb);
    this.cleanupTemplate(templateName);
    this.createTemplateFromBase(seedDb, templateName);
    this.drop(seedDb);
  }
  
}
