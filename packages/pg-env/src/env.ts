import { defaultPgConfig,PgConfig } from './pg-config';

const parseEnvNumber = (val?: string): number | undefined => {
  const num = Number(val);
  return !isNaN(num) ? num : undefined;
};

export const getPgEnvVars = (): Partial<PgConfig> => {
  const {
    PGHOST,
    PGPORT,
    PGUSER,
    PGPASSWORD,
    PGDATABASE
  } = process.env;

  return {
    ...(PGHOST && { host: PGHOST }),
    ...(PGPORT && { port: parseEnvNumber(PGPORT) }),
    ...(PGUSER && { user: PGUSER }),
    ...(PGPASSWORD && { password: PGPASSWORD }),
    ...(PGDATABASE && { database: PGDATABASE }),
  };
};

export const getPgEnvOptions = (overrides: Partial<PgConfig> = {}): PgConfig => {
  const envOpts = getPgEnvVars();
  const merged = { ...defaultPgConfig, ...envOpts, ...overrides };
  return merged;
};

export function toPgEnvVars(config: Partial<PgConfig>): Record<string, string> {
  const opts = { ...defaultPgConfig, ...config };
  return {
    ...(opts.host && { PGHOST: opts.host }),
    ...(opts.port && { PGPORT: String(opts.port) }),
    ...(opts.user && { PGUSER: opts.user }),
    ...(opts.password && { PGPASSWORD: opts.password }),
    ...(opts.database && { PGDATABASE: opts.database }),
  };
}

export function getSpawnEnvWithPg(
  config: Partial<PgConfig>,
  baseEnv: NodeJS.ProcessEnv = process.env
): NodeJS.ProcessEnv {
  return {
    ...baseEnv,
    ...toPgEnvVars(config)
  };
}