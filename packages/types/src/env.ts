import deepmerge from 'deepmerge';
import { launchqlDefaults, LaunchQLOptions, PgConfig, PgTestConnectionOptions } from './launchql';

const parseEnvNumber = (val?: string): number | undefined => {
  const num = Number(val);
  return !isNaN(num) ? num : undefined;
};

const parseEnvBoolean = (val?: string): boolean | undefined => {
  if (val === undefined) return undefined;
  return ['true', '1', 'yes'].includes(val.toLowerCase());
};

export const getEnvOptions = (overrides: LaunchQLOptions = {}): LaunchQLOptions => {
  const envOpts = getEnvVars();
  const defaults = deepmerge(launchqlDefaults, envOpts);
  const options = deepmerge(defaults, overrides);
  // if you need to sanitize...
  return options;
};

export const getPgEnvOptions = (overrides: Partial<PgConfig> = {}): PgConfig => {
  const envOpts = getPgEnvVars();
  const defaults = deepmerge(launchqlDefaults.pg, envOpts);
  const options = deepmerge(defaults, overrides);
  // if you need to sanitize...
  return options;
};

export const getConnEnvOptions = (overrides: Partial<PgTestConnectionOptions> = {}): PgTestConnectionOptions => {
  const opts = getEnvOptions({
    db: overrides
  });
  return opts.db;
};

const getEnvVars = (): LaunchQLOptions => {
  const {
    PGROOTDATABASE,

    PORT,
    SERVER_HOST,
    SERVER_TRUST_PROXY,
    SERVER_ORIGIN,
    SERVER_STRICT_AUTH,

    PGHOST,
    PGPORT,
    PGUSER,
    PGPASSWORD,
    PGDATABASE,

    FEATURES_SIMPLE_INFLECTION,
    FEATURES_OPPOSITE_BASE_NAMES,
    FEATURES_POSTGIS,

    BUCKET_NAME,
    AWS_REGION,
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY,
    MINIO_ENDPOINT,
  } = process.env;

  return {
    db: {
      ...(PGROOTDATABASE && { rootDb: PGROOTDATABASE }),
    },
    server: {
      ...(PORT && { port: parseEnvNumber(PORT) }),
      ...(SERVER_HOST && { host: SERVER_HOST }),
      ...(SERVER_TRUST_PROXY && { trustProxy: parseEnvBoolean(SERVER_TRUST_PROXY) }),
      ...(SERVER_ORIGIN && { origin: SERVER_ORIGIN }),
      ...(SERVER_STRICT_AUTH && { strictAuth: parseEnvBoolean(SERVER_STRICT_AUTH) }),
    },
    pg: {
      ...(PGHOST && { host: PGHOST }),
      ...(PGPORT && { port: parseEnvNumber(PGPORT) }),
      ...(PGUSER && { user: PGUSER }),
      ...(PGPASSWORD && { password: PGPASSWORD }),
      ...(PGDATABASE && { database: PGDATABASE }),
    },
    features: {
      ...(FEATURES_SIMPLE_INFLECTION && { simpleInflection: parseEnvBoolean(FEATURES_SIMPLE_INFLECTION) }),
      ...(FEATURES_OPPOSITE_BASE_NAMES && { oppositeBaseNames: parseEnvBoolean(FEATURES_OPPOSITE_BASE_NAMES) }),
      ...(FEATURES_POSTGIS && { postgis: parseEnvBoolean(FEATURES_POSTGIS) }),
    },
    cdn: {
      ...(BUCKET_NAME && { bucketName: BUCKET_NAME }),
      ...(AWS_REGION && { awsRegion: AWS_REGION }),
      ...(AWS_ACCESS_KEY && { awsAccessKey: AWS_ACCESS_KEY }),
      ...(AWS_SECRET_KEY && { awsSecretKey: AWS_SECRET_KEY }),
      ...(MINIO_ENDPOINT && { minioEndpoint: MINIO_ENDPOINT }),
    }
  };
};

const getPgEnvVars = (): PgConfig => {
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

export function toPgEnvVars(config: Partial<PgConfig>): Record<string, string> {
  const opts = deepmerge(launchqlDefaults.pg, config);
  return {
    ...(opts.host && { PGHOST: opts.host }),
    ...(opts.port && { PGPORT: String(opts.port) }),
    ...(opts.user && { PGUSER: opts.user }),
    ...(opts.password && { PGPASSWORD: opts.password }),
    ...(opts.database && { PGDATABASE: opts.database }),
  };
};

export function getSpawnEnvWithPg(
  config: Partial<PgConfig>,
  baseEnv: NodeJS.ProcessEnv = process.env
): NodeJS.ProcessEnv {
  return {
    ...baseEnv,
    ...toPgEnvVars(config)
  };
}

type NodeEnv = 'development' | 'production' | 'test';

export const getNodeEnv = (): NodeEnv => {
  const env = process.env.NODE_ENV?.toLowerCase();
  if (env === 'production' || env === 'test') return env;
  return 'development';
};