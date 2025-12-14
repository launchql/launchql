import { execSync } from 'child_process';
import { PgConfig } from 'pg-env';
import { JobsConfig } from './jobs';

/**
 * Authentication options for test client sessions
 */
export interface AuthOptions {
    /** Role to assume (defaults to 'authenticated' from RoleMapping config) */
    role?: string;
    /** User ID to set in session context */
    userId?: string | number;
    /** Key name for user ID in session context (defaults to 'jwt.claims.user_id') */
    userIdKey?: string;
}

/**
 * Configuration options for PostgreSQL test database connections
 */
export interface PgTestConnectionOptions {
    /** The root database to connect to for creating test databases */
    rootDb?: string;
    /** Template database to use when creating test databases */
    template?: string;
    /** Prefix to add to test database names */
    prefix?: string;
    /** PostgreSQL extensions to install in test databases */
    extensions?: string[];
    /** Current working directory for database operations */
    cwd?: string;
    /** Database connection credentials */
    connection?: DatabaseConnectionOptions;
    /** Role mapping configuration */
    roles?: RoleMapping;
    /** Default authentication options for db connections */
    auth?: AuthOptions;
}

/**
 * PostgreSQL session context settings for test clients
 * Used to set session variables via set_config() for RLS policies, search_path, etc.
 */
export interface PgTestClientContext {
  /** PostgreSQL role to assume */
  role?: string | null;
  /** Additional session context variables (e.g., 'jwt.claims.user_id', 'search_path') */
  [key: string]: string | null | undefined;
}

/**
* @deprecated Use PgTestClientContext instead (typo fix)
*/
export type PgTextClientContext = PgTestClientContext;

/**
 * Role mapping configuration for database security
 */
export interface RoleMapping {
    /** Anonymous (unauthenticated) role name */
    anonymous?: string;
    /** Authenticated user role name */
    authenticated?: string;
    /** Administrator role name */
    administrator?: string;
    /** Default role for new connections */
    default?: string;
}

/**
 * Database connection credentials
 */
export interface DatabaseConnectionOptions {
    /** Database user name */
    user?: string;
    /** Database password */
    password?: string;
    /** Database role to assume */
    role?: string;
}

/**
 * HTTP server configuration
 */
export interface ServerOptions {
    /** Server host address */
    host?: string;
    /** Server port number */
    port?: number;
    /** Whether to trust proxy headers */
    trustProxy?: boolean;
    /** CORS origin configuration */
    origin?: string;
    /** Whether to enforce strict authentication */
    strictAuth?: boolean;
}

/**
 * CDN and file storage configuration
 */
export interface CDNOptions {
    /** S3 bucket name for file storage */
    bucketName?: string;
    /** AWS region for S3 bucket */
    awsRegion?: string;
    /** AWS access key for S3 */
    awsAccessKey?: string;
    /** AWS secret key for S3 */
    awsSecretKey?: string;
    /** MinIO endpoint URL for local development */
    minioEndpoint?: string;
}

/**
 * Code generation settings
 */
export interface CodegenOptions {
    /** Whether to wrap generated SQL code in transactions */
    useTx?: boolean;
}

/**
 * Migration and code generation options
 */
export interface MigrationOptions {
    /** Code generation settings */
    codegen?: CodegenOptions;
}

/**
 * Configuration for PGPM workspace
 */
export interface PgpmWorkspaceConfig {
  /** Glob patterns for package directories */
  packages: string[];
  /** Optional workspace metadata */
  name?: string;
  version?: string;
  /** Additional workspace settings */
  settings?: {
    [key: string]: any;
  };
  /** Deployment configuration for the workspace */
  deployment?: Omit<DeploymentOptions, 'toChange'>;
}

/**
 * Configuration options for module deployment
 */
export interface DeploymentOptions {
    /** Whether to wrap deployments in database transactions */
    useTx?: boolean;
    /** Use fast deployment strategy (skip migration system) */
    fast?: boolean;
    /** Whether to use Sqitch plan files for deployments */
    usePlan?: boolean;
    /** Enable caching of deployment packages */
    cache?: boolean;
    /** Deploy up to a specific change (inclusive) - can be a change name or tag reference (e.g., '@v1.0.0') */
    toChange?: string;
    /** Log-only mode - skip script execution and only record deployment metadata */
    logOnly?: boolean;
    /** 
     * Hash method for SQL files:
     * - 'content': Hash the raw file content (fast, but sensitive to formatting changes)
     * - 'ast': Hash the parsed AST structure (robust, ignores formatting/comments but slower)
     */
    hashMethod?: 'content' | 'ast';
}

/**
 * Main configuration options for the PGPM framework
 * Note: GraphQL/Graphile options (graphile, api, features) are in @launchql/types
 */
export interface PgpmOptions {
    /** Test database configuration options */
    db?: Partial<PgTestConnectionOptions>;
    /** PostgreSQL connection configuration */
    pg?: Partial<PgConfig>;
    /** HTTP server configuration */
    server?: ServerOptions;
    /** CDN and file storage configuration */
    cdn?: CDNOptions;
    /** Module deployment configuration */
    deployment?: DeploymentOptions;
    /** Migration and code generation options */
    migrations?: MigrationOptions;
    /** Job system configuration */
    jobs?: JobsConfig;
}

/**
 * Default configuration values for PGPM framework
 */
export const pgpmDefaults: PgpmOptions = {
  db: {
    rootDb: 'postgres',
    prefix: 'db-',
    extensions: [],
    cwd: process.cwd(),
    connection: {
      user: 'app_user',
      password: 'app_password',
      // TODO: check if this is used vs. roles below...
      role: 'anonymous'
    },
    roles: {
      anonymous: 'anonymous',
      authenticated: 'authenticated',
      administrator: 'administrator',
      default: 'anonymous'
    }
  },
  pg: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'postgres',
  },
  server: {
    host: 'localhost',
    port: 3000,
    trustProxy: false,
    strictAuth: false,
  },
  cdn: {
    bucketName: 'test-bucket',
    awsRegion: 'us-east-1',
    awsAccessKey: 'minioadmin',
    awsSecretKey: 'minioadmin',
    minioEndpoint: 'http://localhost:9000'
  },
  deployment: {
    useTx: true,
    fast: false,
    usePlan: true,
    cache: false,
    logOnly: false,
    hashMethod: 'content'
  },
  migrations: {
    codegen: {
      useTx: false
    }
  },
  jobs: {
    pg: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'jobs'
    },
    schema: {
      schema: 'app_jobs'
    },
    worker: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'jobs',
      schema: 'app_jobs',
      hostname: 'worker-0',
      supportAny: true,
      supported: [],
      pollInterval: 1000,
      gracefulShutdown: true
    },
    scheduler: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'jobs',
      schema: 'app_jobs',
      hostname: 'scheduler-0',
      supportAny: true,
      supported: [],
      pollInterval: 1000,
      gracefulShutdown: true
    },
    openFaas: {
      gateway: {
        gatewayUrl: 'http://gateway:8080',
        callbackUrl: 'http://callback:12345',
        callbackPort: 12345
      },
      server: {
        schema: 'app_jobs',
        port: 3000,
        host: 'localhost'
      }
    }
  }
};

export function getGitConfigInfo(): { username: string; email: string } {
  const isTestEnv =
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'testing' || // fallback
    process.env.GITHUB_ACTIONS === 'true'; // GitHub Actions

  if (isTestEnv) {
    return {
      username: 'CI Test User',
      email: 'ci@example.com'
    };
  }

  let username = '';
  let email = '';

  try {
    username = execSync('git config --global user.name', {
      encoding: 'utf8'
    }).trim();
  } catch {
    username = '';
  }

  try {
    email = execSync('git config --global user.email', {
      encoding: 'utf8'
    }).trim();
  } catch {
    email = '';
  }

  return { username, email };
}
