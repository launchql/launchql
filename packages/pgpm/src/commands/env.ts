import { spawn } from 'child_process';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { defaultPgConfig, PgConfig } from 'pg-env';

const envUsageText = `
Environment Command:

  pgpm env [OPTIONS] [COMMAND...]

  Manage PostgreSQL environment variables with profile support.

Profiles:
  (default)          Use local Postgres development profile
  --supabase         Use Supabase local development profile

Modes:
  No command         Print export statements for shell evaluation
  With command       Execute command with environment variables applied

Options:
  --help, -h         Show this help message
  --supabase         Use Supabase profile instead of default Postgres

Examples:
  pgpm env                                    Print default Postgres env exports
  pgpm env --supabase                         Print Supabase env exports
  eval "$(pgpm env)"                          Load default Postgres env into shell
  eval "$(pgpm env --supabase)"               Load Supabase env into shell
  pgpm env lql deploy --database db1          Run command with default Postgres env
  pgpm env createdb mydb                      Run command with default Postgres env
  pgpm env --supabase lql deploy --database db1  Run command with Supabase env
  pgpm env --supabase createdb mydb           Run command with Supabase env
`;

const SUPABASE_PROFILE: PgConfig = {
  host: 'localhost',
  port: 54322,
  user: 'supabase_admin',
  password: 'postgres',
  database: 'postgres'
};

const DEFAULT_PROFILE: PgConfig = {
  ...defaultPgConfig
};

function configToEnvVars(config: PgConfig): Record<string, string> {
  return {
    PGHOST: config.host,
    PGPORT: String(config.port),
    PGUSER: config.user,
    PGPASSWORD: config.password,
    PGDATABASE: config.database
  };
}

function printExports(config: PgConfig): void {
  const envVars = configToEnvVars(config);
  for (const [key, value] of Object.entries(envVars)) {
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    console.log(`export ${key}="${escapedValue}"`);
  }
}

function executeCommand(config: PgConfig, command: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const envVars = configToEnvVars(config);
    const env = {
      ...process.env,
      ...envVars
    };

    const child = spawn(command, args, {
      env,
      stdio: 'inherit',
      shell: false
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      resolve(code ?? 0);
    });
  });
}

export default async (
  argv: Partial<ParsedArgs>,
  _prompter: Inquirerer
) => {
  if (argv.help || argv.h) {
    console.log(envUsageText);
    process.exit(0);
  }

  const useSupabase = argv.supabase === true || typeof argv.supabase === 'string';
  const profile = useSupabase ? SUPABASE_PROFILE : DEFAULT_PROFILE;

  const rawArgs = process.argv.slice(2);
  
  let envIndex = rawArgs.findIndex(arg => arg === 'env');
  if (envIndex === -1) {
    envIndex = 0;
  }
  
  const argsAfterEnv = rawArgs.slice(envIndex + 1);
  
  const supabaseIndex = argsAfterEnv.findIndex(arg => arg === '--supabase');
  
  let commandArgs: string[];
  if (supabaseIndex !== -1) {
    commandArgs = argsAfterEnv.slice(supabaseIndex + 1);
  } else {
    commandArgs = argsAfterEnv;
  }
  
  commandArgs = commandArgs.filter(arg => arg !== '--cwd' && !arg.startsWith('--cwd='));
  
  const cwdIndex = commandArgs.findIndex(arg => arg === '--cwd');
  if (cwdIndex !== -1 && cwdIndex + 1 < commandArgs.length) {
    commandArgs.splice(cwdIndex, 2);
  }

  if (commandArgs.length === 0) {
    printExports(profile);
    return;
  }

  const [command, ...args] = commandArgs;
  
  try {
    const exitCode = await executeCommand(profile, command, args);
    process.exit(exitCode);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error executing command: ${error.message}`);
    } else {
      console.error(`Error executing command: ${String(error)}`);
    }
    process.exit(1);
  }
};
