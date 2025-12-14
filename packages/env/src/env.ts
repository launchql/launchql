import { PgpmOptions } from '@pgpmjs/types';

const parseEnvNumber = (val?: string): number | undefined => {
  const num = Number(val);
  return !isNaN(num) ? num : undefined;
};

const parseEnvBoolean = (val?: string): boolean | undefined => {
  if (val === undefined) return undefined;
  return ['true', '1', 'yes'].includes(val.toLowerCase());
};

export const getEnvVars = (): PgpmOptions => {
  const {
    PGROOTDATABASE,
    PGTEMPLATE,
    DB_PREFIX,
    DB_EXTENSIONS,
    DB_CWD,
    DB_CONNECTION_USER,
    DB_CONNECTION_PASSWORD,
    DB_CONNECTION_ROLE,

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

    GRAPHILE_SCHEMA,

    FEATURES_SIMPLE_INFLECTION,
    FEATURES_OPPOSITE_BASE_NAMES,
    FEATURES_POSTGIS,
    API_ENABLE_META,
    API_IS_PUBLIC,
    API_EXPOSED_SCHEMAS,
    API_META_SCHEMAS,
    API_ANON_ROLE,
    API_ROLE_NAME,
    API_DEFAULT_DATABASE_ID,

    BUCKET_NAME,
    AWS_REGION,
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY,
    MINIO_ENDPOINT,

    DEPLOYMENT_USE_TX,
    DEPLOYMENT_FAST,
    DEPLOYMENT_USE_PLAN,
    DEPLOYMENT_CACHE,
    DEPLOYMENT_TO_CHANGE,

    MIGRATIONS_CODEGEN_USE_TX,
  } = process.env;

  return {
    db: {
      ...(PGROOTDATABASE && { rootDb: PGROOTDATABASE }),
      ...(PGTEMPLATE && { template: PGTEMPLATE }),
      ...(DB_PREFIX && { prefix: DB_PREFIX }),
      ...(DB_EXTENSIONS && { extensions: DB_EXTENSIONS.split(',').map(ext => ext.trim()) }),
      ...(DB_CWD && { cwd: DB_CWD }),
      ...((DB_CONNECTION_USER || DB_CONNECTION_PASSWORD || DB_CONNECTION_ROLE) && {
        connection: {
          ...(DB_CONNECTION_USER && { user: DB_CONNECTION_USER }),
          ...(DB_CONNECTION_PASSWORD && { password: DB_CONNECTION_PASSWORD }),
          ...(DB_CONNECTION_ROLE && { role: DB_CONNECTION_ROLE }),
        }
      }),
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
    graphile: {
      ...(GRAPHILE_SCHEMA && { 
        schema: GRAPHILE_SCHEMA.includes(',') 
          ? GRAPHILE_SCHEMA.split(',').map(s => s.trim())
          : GRAPHILE_SCHEMA 
      }),
    },
    features: {
      ...(FEATURES_SIMPLE_INFLECTION && { simpleInflection: parseEnvBoolean(FEATURES_SIMPLE_INFLECTION) }),
      ...(FEATURES_OPPOSITE_BASE_NAMES && { oppositeBaseNames: parseEnvBoolean(FEATURES_OPPOSITE_BASE_NAMES) }),
      ...(FEATURES_POSTGIS && { postgis: parseEnvBoolean(FEATURES_POSTGIS) }),
    },
    api: {
      ...(API_ENABLE_META && { enableMetaApi: parseEnvBoolean(API_ENABLE_META) }),
      ...(API_IS_PUBLIC && { isPublic: parseEnvBoolean(API_IS_PUBLIC) }),
      ...(API_EXPOSED_SCHEMAS && { exposedSchemas: API_EXPOSED_SCHEMAS.split(',').map(s => s.trim()) }),
      ...(API_META_SCHEMAS && { metaSchemas: API_META_SCHEMAS.split(',').map(s => s.trim()) }),
      ...(API_ANON_ROLE && { anonRole: API_ANON_ROLE }),
      ...(API_ROLE_NAME && { roleName: API_ROLE_NAME }),
      ...(API_DEFAULT_DATABASE_ID && { defaultDatabaseId: API_DEFAULT_DATABASE_ID }),
    },
    cdn: {
      ...(BUCKET_NAME && { bucketName: BUCKET_NAME }),
      ...(AWS_REGION && { awsRegion: AWS_REGION }),
      ...(AWS_ACCESS_KEY && { awsAccessKey: AWS_ACCESS_KEY }),
      ...(AWS_SECRET_KEY && { awsSecretKey: AWS_SECRET_KEY }),
      ...(MINIO_ENDPOINT && { minioEndpoint: MINIO_ENDPOINT }),
    },
    deployment: {
      ...(DEPLOYMENT_USE_TX && { useTx: parseEnvBoolean(DEPLOYMENT_USE_TX) }),
      ...(DEPLOYMENT_FAST && { fast: parseEnvBoolean(DEPLOYMENT_FAST) }),
      ...(DEPLOYMENT_USE_PLAN && { usePlan: parseEnvBoolean(DEPLOYMENT_USE_PLAN) }),
      ...(DEPLOYMENT_CACHE && { cache: parseEnvBoolean(DEPLOYMENT_CACHE) }),
      ...(DEPLOYMENT_TO_CHANGE && { toChange: DEPLOYMENT_TO_CHANGE }),
    },
    migrations: {
      ...(MIGRATIONS_CODEGEN_USE_TX && {
        codegen: {
          useTx: parseEnvBoolean(MIGRATIONS_CODEGEN_USE_TX)
        }
      }),
    }
  };
};

type NodeEnv = 'development' | 'production' | 'test';

export const getNodeEnv = (): NodeEnv => {
  const env = process.env.NODE_ENV?.toLowerCase();
  if (env === 'production' || env === 'test') return env;
  return 'development';
};
