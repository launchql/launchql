import { execSync } from 'child_process';
import { PgConfig } from 'pg-env';

import { PgpmDriverConfig, PgpmEngineConfig } from './driver';
import { PgpmRoutingProfile } from './routing';

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
 * How DEFERRABLE INITIALLY DEFERRED constraints are treated inside a test transaction.
 *
 * Test isolation rolls every test back instead of committing, so constraints that
 * Postgres only checks at COMMIT would otherwise never fire.
 *
 * - `'off'`       leave them deferred and never checked (default)
 * - `'check'`     run the commit-time checks at the end of each test, right before the
 *                 rollback (`SET CONSTRAINTS ALL IMMEDIATE`); deferral still works inside the test
 * - `'immediate'` `SET CONSTRAINTS ALL IMMEDIATE` at the start of each test so violations
 *                 fail on the offending statement; disables deferral the code under test may rely on
 */
export type DeferredConstraintsMode = 'off' | 'check' | 'immediate';

/**
 * Configuration options for PostgreSQL test database connections
 */
export interface PgTestConnectionOptions {
    /** How deferred constraints are handled under rollback-based test isolation (default: 'off') */
    deferredConstraints?: DeferredConstraintsMode;
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
    /** Test user credentials for app and admin users */
    connections?: TestUserCredentials;
    /** Role mapping configuration */
    roles?: RoleMapping;
    /** Default authentication options for db connections */
    auth?: AuthOptions;
    /** Use advisory locks for role/user creation (for concurrency safety) */
    useLocksForRoles?: boolean;
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
 * Role mapping configuration for database security
 */
export interface RoleMapping {
    /** Anonymous (unauthenticated) role name */
    anonymous?: string;
    /** Authenticated user role name */
    authenticated?: string;
    /** Administrator role name */
    administrator?: string;
    /** Restricted proxy client role name (opt-in; created via `admin-users bootstrap --client`) */
    authenticatedClient?: string;
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
 * Test user credentials for app and admin users
 */
export interface TestUserCredentials {
    /** App user credentials (for RLS simulation) */
    app?: DatabaseConnectionOptions;
    /** Admin user credentials (for test admin operations) */
    admin?: DatabaseConnectionOptions;
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
 * Storage provider type for bucket operations
 */
export type BucketProvider = 's3' | 'minio' | 'rustfs' | 'gcs';

/**
 * Object-store credentials — the only storage input read from the environment
 * (`STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`). Endpoint, provider,
 * region and public URL prefix are `storage_module` rows, never config.
 */
export interface StorageCredentialOptions {
    accessKeyId?: string;
    secretAccessKey?: string;
}

/**
 * SMTP email configuration options
 */
export interface SmtpOptions {
    /** SMTP server hostname */
    host?: string;
    /** SMTP server port (defaults to 587 for non-secure, 465 for secure) */
    port?: number;
    /** Use TLS/SSL connection (defaults based on port: true for 465, false otherwise) */
    secure?: boolean;
    /** SMTP authentication username */
    user?: string;
    /** SMTP authentication password */
    pass?: string;
    /** Default sender email address */
    from?: string;
    /** Default reply-to email address */
    replyTo?: string;
    /** Require TLS upgrade via STARTTLS */
    requireTLS?: boolean;
    /** Reject unauthorized TLS certificates */
    tlsRejectUnauthorized?: boolean;
    /** Use connection pooling for multiple emails */
    pool?: boolean;
    /** Maximum number of pooled connections */
    maxConnections?: number;
    /** Maximum messages per connection before reconnecting */
    maxMessages?: number;
    /** SMTP client hostname for EHLO/HELO */
    name?: string;
    /** Enable nodemailer logging */
    logger?: boolean;
    /** Enable nodemailer debug output */
    debug?: boolean;
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
 * Error output formatting options for controlling verbosity of error messages
 */
export interface ErrorOutputOptions {
    /** Maximum number of queries to show in error output (default: 30) */
    queryHistoryLimit?: number;
    /** Maximum total characters for error output before truncation (default: 10000) */
    maxLength?: number;
    /** When true, disables all limiting and shows full error output (default: false) */
    verbose?: boolean;
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
  /**
   * Workspace-level pgpm module dependencies (npm package name -> exact version).
   * Recorded by `pgpm install` when run at the workspace root; `pgpm install`
   * with no arguments at the workspace root installs these into extensions/.
   */
  dependencies?: Record<string, string>;
  /**
   * Directory (relative to the workspace root) where pgpm modules are installed.
   * Defaults to `extensions`. Useful for keeping ephemeral test/fixture installs
   * out of a committed `extensions/` directory.
   */
  extensionsDir?: string;
  /**
   * Template source recorded at scaffold time when the workspace is created
   * from a non-default boilerplate repo (e.g. via `pgpm init workspace --pglite`
   * or `--repo`). `pgpm init` reads this so modules created inside the workspace
   * inherit the same boilerplate source without re-specifying the flag.
   */
  boilerplates?: {
    /** Template repository URL */
    repo: string;
    /** Branch/tag to clone */
    branch?: string;
    /** Template variant directory */
    dir?: string;
  };
  /**
   * Workspace-level routing profile: the default routing policy (schemas,
   * object routes, extension routing, role translation) applied to every
   * apply/transpile in the workspace. A proxy module's `pgpm.apply.json`
   * overrides it per key (inner scope wins).
   */
  portability?: PgpmRoutingProfile;
}

/**
 * Configuration options for module deployment
 */
export interface DeploymentOptions {
    /** Whether to wrap deployments in database transactions */
    useTx?: boolean;
    /**
     * Use the fast deployment strategy: execute each module's pending changes in
     * one round-trip and bulk-record the `pgpm_migrate` ledger, reading the
     * pre-built bundle artifact (`sql/<name>--<version>.bundle.tar.gz`) when it
     * verifies and building the same structure from `deploy/` when it does not.
     * Falls back to the per-change migration path if those semantics cannot be
     * honoured (e.g. `hashMethod: 'ast'`).
     */
    fast?: boolean;
    /** Alias for {@link fast}, naming the bundle artifact it prefers to read. */
    bundled?: boolean;
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
 * Note: GraphQL/Graphile options (graphile, api, features) are in @constructive-io/graphql-types
 */
export interface PgpmOptions {
    /** Test database configuration options */
    db?: Partial<PgTestConnectionOptions>;
    /** PostgreSQL connection configuration */
    pg?: Partial<PgConfig>;
    /** HTTP server configuration */
    server?: ServerOptions;
    /** Object-store credentials (coordinates live in storage_module) */
    storage?: StorageCredentialOptions;
    /** Module deployment configuration */
    deployment?: DeploymentOptions;
    /** Migration and code generation options */
    migrations?: MigrationOptions;
    /** Error output formatting options */
    errorOutput?: ErrorOutputOptions;
    /** SMTP email configuration */
    smtp?: SmtpOptions;
    /**
     * Directory (relative to the workspace root) where pgpm modules are installed
     * by `pgpm install`. Defaults to `extensions`.
     */
    extensionsDir?: string;
    /**
     * Name of the migration backend to target, like sqitch's `core.engine`.
     * Defaults to `pg` (the built-in server path); `pglite` is also built in,
     * and any other name must be declared in {@link engines}.
     */
    engine?: string;
    /**
     * Engine definitions, the analogue of sqitch's `[engine "name"]` sections.
     * Entries override/extend {@link BUILTIN_ENGINES}, mapping an engine name to
     * the driver plugin backing it plus that engine's default options.
     */
    engines?: Record<string, PgpmEngineConfig>;
    /**
     * Pluggable migration backend, named by plugin package rather than by engine
     * name — the low-level escape hatch behind {@link engine}. Undefined = the
     * built-in `pg` (server) path. Resolved from the consumer's `node_modules`.
     */
    driver?: PgpmDriverConfig;
}

/**
 * Default directory (relative to the workspace root) where pgpm modules are installed.
 */
export const DEFAULT_EXTENSIONS_DIR = 'extensions';

/**
 * Default configuration values for PGPM framework
 */
export const pgpmDefaults: PgpmOptions = {
  db: {
    rootDb: 'postgres',
    prefix: 'db-',
    extensions: [],
    cwd: process.cwd(),
    connections: {
      app: {
        user: 'app_user',
        password: 'app_password'
      },
      admin: {
        user: 'app_admin',
        password: 'admin_password'
      }
    },
    roles: {
      anonymous: 'anonymous',
      authenticated: 'authenticated',
      administrator: 'administrator',
      default: 'anonymous'
    },
    useLocksForRoles: false
  },
  pg: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'postgres'
  },
  server: {
    host: 'localhost',
    port: 3000,
    trustProxy: false,
    strictAuth: false
  },
  deployment: {
    useTx: true,
    fast: false,
    bundled: false,
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
  errorOutput: {
    queryHistoryLimit: 30,
    maxLength: 10000,
    verbose: false
  },
  extensionsDir: DEFAULT_EXTENSIONS_DIR,
  smtp: {
    port: 587,
    secure: false,
    pool: false,
    logger: false,
    debug: false
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
