import { execSync } from 'child_process';
import { PgConfig } from './types';

export interface TemplatedbConfig extends PgConfig {
  template: string;
}

const getPgEnv = (config: PgConfig) => {
  return {
    PGHOST: config.host,
    PGPORT: String(config.port),
    PGUSER: config.user,
    PGPASSWORD: config.password,
  }
}

export function run(command: string, env: Record<string, string | undefined> = {}) {
  execSync(command, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...env,
    },
  });
}

function safeDropDb(config: PgConfig, name: string): void {
  try {
    run(`dropdb ${name}`, getPgEnv(config));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('does not exist')) {
      console.warn(`⚠️  Could not drop database ${name}: ${message}`);
    }
  }
}

export function dropdb(config: PgConfig): void {
  safeDropDb(config, config.database);
}

export function droptemplatedb(config: PgConfig): void {
  run(
    `psql -c "UPDATE pg_database SET datistemplate='false' WHERE datname='${config.database}';"`,
    getPgEnv(config)
  );
  dropdb(config);
}

export function createdb(config: PgConfig): void {
  run(`createdb -U ${config.user} -h ${config.host} -p ${config.port} ${config.database}`, {
    PGPASSWORD: config.password,
  });
}

export function templatedb(config: TemplatedbConfig): void {
  run(
    `createdb -U ${config.user} -h ${config.host} -p ${config.port} -e ${config.database} -T ${config.template}`,
    {
      PGPASSWORD: config.password,
    }
  );
}

export function installExt(
  config: PgConfig,
  extensions: string[] | string
): void {
  const extList = typeof extensions === 'string' ? extensions.split(',') : extensions;

  for (const extension of extList) {
    run(
      `psql --dbname "${config.database}" -c 'CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;'`,
      getPgEnv(config)
    );
  }
}

export function connectionString(config: PgConfig): string {
  return `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

export function createTemplateFromBase(config: PgConfig, base: string, template: string): void {
  run(`createdb -T ${base} ${template}`, getPgEnv(config));
  run(`psql -c "UPDATE pg_database SET datistemplate = true WHERE datname = '${template}';"`, getPgEnv(config));
}

export function cleanupTemplateDatabase(config: PgConfig, template: string): void {
  try {
    run(`psql -c "UPDATE pg_database SET datistemplate = false WHERE datname = '${template}'"`, getPgEnv(config));
  } catch {}
  safeDropDb(config, template);
}

export function createRole(config: PgConfig, role: string, password: string): void {
  run(
    `psql -d ${config.database} -c "CREATE ROLE ${role} WITH LOGIN PASSWORD '${password}';"`,
    getPgEnv(config)
  );
}

export function grantConnect(config: PgConfig, role: string): void {
  run(
    `psql -d ${config.database} -c "GRANT CONNECT ON DATABASE ${config.database} TO ${role};"`,
    getPgEnv(config)
  );
}
