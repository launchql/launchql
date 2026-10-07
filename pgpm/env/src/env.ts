import { DeferredConstraintsMode, PgpmOptions } from '@pgpmjs/types';
import { parseEnvBoolean, parseEnvList, parseEnvNumber } from '12factor-env';

export { parseEnvBoolean, parseEnvList, parseEnvNumber };

const DEFERRED_CONSTRAINTS_MODES: DeferredConstraintsMode[] = ['off', 'check', 'immediate'];

const parseDeferredConstraintsMode = (value: string): DeferredConstraintsMode => {
  const mode = value.trim().toLowerCase() as DeferredConstraintsMode;
  if (!DEFERRED_CONSTRAINTS_MODES.includes(mode)) {
    throw new Error(
      `Invalid DB_DEFERRED_CONSTRAINTS "${value}"; expected one of ${DEFERRED_CONSTRAINTS_MODES.join(', ')}`
    );
  }
  return mode;
};

/**
 * Parse core PGPM environment variables.
 * GraphQL-related env vars (GRAPHILE_*, FEATURES_*, API_*) are handled by @constructive-io/graphql-env.
 * 
 * @param env - Environment object to read from (defaults to process.env for backwards compatibility)
 */
export const getEnvVars = (env: NodeJS.ProcessEnv = process.env): PgpmOptions => {
  const {
    PGROOTDATABASE,
    PGTEMPLATE,
    DB_PREFIX,
    DB_EXTENSIONS,
    DB_CWD,
    DB_DEFERRED_CONSTRAINTS,
    PGPM_EXTENSIONS_DIR,
    PGPM_ENGINE,
    DB_CONNECTION_USER,
    DB_CONNECTION_PASSWORD,
    DB_CONNECTION_ROLE,
    // New connections.app and connections.admin env vars
    DB_CONNECTIONS_APP_USER,
    DB_CONNECTIONS_APP_PASSWORD,
    DB_CONNECTIONS_ADMIN_USER,
    DB_CONNECTIONS_ADMIN_PASSWORD,

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

    STORAGE_ACCESS_KEY_ID,
    STORAGE_SECRET_ACCESS_KEY,

    DEPLOYMENT_USE_TX,
    DEPLOYMENT_FAST,
    DEPLOYMENT_BUNDLED,
    DEPLOYMENT_USE_PLAN,
    DEPLOYMENT_CACHE,
    DEPLOYMENT_TO_CHANGE,

    MIGRATIONS_CODEGEN_USE_TX,

    // Error output formatting env vars
    PGPM_ERROR_QUERY_HISTORY_LIMIT,
    PGPM_ERROR_MAX_LENGTH,
    PGPM_ERROR_VERBOSE,

    // SMTP email env vars
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    SMTP_REPLY_TO,
    SMTP_REQUIRE_TLS,
    SMTP_TLS_REJECT_UNAUTHORIZED,
    SMTP_POOL,
    SMTP_MAX_CONNECTIONS,
    SMTP_MAX_MESSAGES,
    SMTP_NAME,
    SMTP_LOGGER,
    SMTP_DEBUG
  } = env;

  return {
    ...(PGPM_EXTENSIONS_DIR && { extensionsDir: PGPM_EXTENSIONS_DIR }),
    ...(PGPM_ENGINE && { engine: PGPM_ENGINE }),
    db: {
      ...(PGROOTDATABASE && { rootDb: PGROOTDATABASE }),
      ...(PGTEMPLATE && { template: PGTEMPLATE }),
      ...(DB_PREFIX && { prefix: DB_PREFIX }),
      ...(DB_EXTENSIONS && { extensions: DB_EXTENSIONS.split(',').map(ext => ext.trim()) }),
      ...(DB_CWD && { cwd: DB_CWD }),
      ...(DB_DEFERRED_CONSTRAINTS && { deferredConstraints: parseDeferredConstraintsMode(DB_DEFERRED_CONSTRAINTS) }),
      ...((DB_CONNECTION_USER || DB_CONNECTION_PASSWORD || DB_CONNECTION_ROLE) && {
        connection: {
          ...(DB_CONNECTION_USER && { user: DB_CONNECTION_USER }),
          ...(DB_CONNECTION_PASSWORD && { password: DB_CONNECTION_PASSWORD }),
          ...(DB_CONNECTION_ROLE && { role: DB_CONNECTION_ROLE }),
        }
      }),
      ...((DB_CONNECTIONS_APP_USER || DB_CONNECTIONS_APP_PASSWORD || DB_CONNECTIONS_ADMIN_USER || DB_CONNECTIONS_ADMIN_PASSWORD) && {
        connections: {
          ...((DB_CONNECTIONS_APP_USER || DB_CONNECTIONS_APP_PASSWORD) && {
            app: {
              ...(DB_CONNECTIONS_APP_USER && { user: DB_CONNECTIONS_APP_USER }),
              ...(DB_CONNECTIONS_APP_PASSWORD && { password: DB_CONNECTIONS_APP_PASSWORD }),
            }
          }),
          ...((DB_CONNECTIONS_ADMIN_USER || DB_CONNECTIONS_ADMIN_PASSWORD) && {
            admin: {
              ...(DB_CONNECTIONS_ADMIN_USER && { user: DB_CONNECTIONS_ADMIN_USER }),
              ...(DB_CONNECTIONS_ADMIN_PASSWORD && { password: DB_CONNECTIONS_ADMIN_PASSWORD }),
            }
          }),
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
    storage: {
      ...(STORAGE_ACCESS_KEY_ID && { accessKeyId: STORAGE_ACCESS_KEY_ID }),
      ...(STORAGE_SECRET_ACCESS_KEY && { secretAccessKey: STORAGE_SECRET_ACCESS_KEY }),
    },
    deployment: {
      ...(DEPLOYMENT_USE_TX && { useTx: parseEnvBoolean(DEPLOYMENT_USE_TX) }),
      ...(DEPLOYMENT_FAST && { fast: parseEnvBoolean(DEPLOYMENT_FAST) }),
      ...(DEPLOYMENT_BUNDLED && { bundled: parseEnvBoolean(DEPLOYMENT_BUNDLED) }),
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
    },
    errorOutput: {
      ...(PGPM_ERROR_QUERY_HISTORY_LIMIT && { queryHistoryLimit: parseEnvNumber(PGPM_ERROR_QUERY_HISTORY_LIMIT) }),
      ...(PGPM_ERROR_MAX_LENGTH && { maxLength: parseEnvNumber(PGPM_ERROR_MAX_LENGTH) }),
      ...(PGPM_ERROR_VERBOSE && { verbose: parseEnvBoolean(PGPM_ERROR_VERBOSE) }),
    },
    smtp: {
      ...(SMTP_HOST && { host: SMTP_HOST }),
      ...(SMTP_PORT && { port: parseEnvNumber(SMTP_PORT) }),
      ...(SMTP_SECURE && { secure: parseEnvBoolean(SMTP_SECURE) }),
      ...(SMTP_USER && { user: SMTP_USER }),
      ...(SMTP_PASS && { pass: SMTP_PASS }),
      ...(SMTP_FROM && { from: SMTP_FROM }),
      ...(SMTP_REPLY_TO && { replyTo: SMTP_REPLY_TO }),
      ...(SMTP_REQUIRE_TLS && { requireTLS: parseEnvBoolean(SMTP_REQUIRE_TLS) }),
      ...(SMTP_TLS_REJECT_UNAUTHORIZED && { tlsRejectUnauthorized: parseEnvBoolean(SMTP_TLS_REJECT_UNAUTHORIZED) }),
      ...(SMTP_POOL && { pool: parseEnvBoolean(SMTP_POOL) }),
      ...(SMTP_MAX_CONNECTIONS && { maxConnections: parseEnvNumber(SMTP_MAX_CONNECTIONS) }),
      ...(SMTP_MAX_MESSAGES && { maxMessages: parseEnvNumber(SMTP_MAX_MESSAGES) }),
      ...(SMTP_NAME && { name: SMTP_NAME }),
      ...(SMTP_LOGGER && { logger: parseEnvBoolean(SMTP_LOGGER) }),
      ...(SMTP_DEBUG && { debug: parseEnvBoolean(SMTP_DEBUG) }),
    }
  };
};

type NodeEnv = 'development' | 'production' | 'test';

export const getNodeEnv = (): NodeEnv => {
  const env = process.env.NODE_ENV?.toLowerCase();
  if (env === 'production' || env === 'test') return env;
  return 'development';
};
