import { PostGraphileOptions } from 'postgraphile';
import type { Plugin } from 'graphile-build';
import { execSync } from 'child_process';
import { PgConfig } from 'pg-env';

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
    connection?: {
      /** Database user name */
      user?: string;
      /** Database password */
      password?: string;
      /** Database role to assume */
      role?: string;
    }
  }

/**
 * Configuration options for the LaunchQL API
 */
export interface ApiOptions {
    /** Whether to enable the meta API endpoints */
    enableMetaApi?: boolean;
    /** Database schemas to expose through the API */
    exposedSchemas?: string[];
    /** Anonymous role name for unauthenticated requests */
    anonRole?: string;
    /** Default role name for authenticated requests */
    roleName?: string;
    /** Default database identifier to use */
    defaultDatabaseId?: string;
    /** Whether the API is publicly accessible */
    isPublic?: boolean;
    /** Schemas containing metadata tables */
    metaSchemas?: string[];
}

/**
 * Main configuration options for the LaunchQL framework
 */
export interface LaunchQLOptions {
    /** Test database configuration options */
    db?: Partial<PgTestConnectionOptions>;
    /** PostgreSQL connection configuration */
    pg?: Partial<PgConfig>;
    /** PostGraphile/Graphile configuration */
    graphile?: {
        /** Database schema(s) to expose through GraphQL */
        schema?: string | string[];
        /** Additional Graphile plugins to load */
        appendPlugins?: Plugin[];
        /** Build options for Graphile */
        graphileBuildOptions?: PostGraphileOptions['graphileBuildOptions'];
        /** Override settings for PostGraphile */
        overrideSettings?: Partial<PostGraphileOptions>;
    };
    /** HTTP server configuration */
    server?: {
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
    };
    /** Feature flags and toggles */
    features?: {
        /** Use simple inflection for GraphQL field names */
        simpleInflection?: boolean;
        /** Use opposite base names for relationships */
        oppositeBaseNames?: boolean;
        /** Enable PostGIS spatial database support */
        postgis?: boolean;
    };
    /** API configuration options */
    api?: ApiOptions;
    /** CDN and file storage configuration */
    cdn?: {
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
    };
    /** Module deployment configuration */
    deployment?: {
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
        /** Deploy only a single module instead of workspace-wide deployment */
        singleModule?: boolean;
    };
    /** Migration and code generation options */
    migrations?: {
        /** Code generation settings */
        codegen?: {
            /** Whether to wrap generated SQL code in transactions */
            useTx?: boolean;
        };
    };
}

/**
 * Default configuration values for LaunchQL framework
 */
export const launchqlDefaults: LaunchQLOptions = {
    db: {
        rootDb: 'postgres',
        prefix: 'db-',
        extensions: [],
        cwd: process.cwd(),
        connection: {
            user: 'app_user',
            password: 'app_password',
            role: 'anonymous'
        }
    },
    pg: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'password',
        database: 'postgres',
    },
    graphile: {
        schema: [],
        appendPlugins: [],
        overrideSettings: {},
        graphileBuildOptions: {},
    },
    server: {
        host: 'localhost',
        port: 3000,
        trustProxy: false,
        strictAuth: false,
    },
    features: {
        simpleInflection: true,
        oppositeBaseNames: true,
        postgis: true
    },
    api: {
        enableMetaApi: true,
        exposedSchemas: [],
        anonRole: 'administrator',
        roleName: 'administrator',
        defaultDatabaseId: 'hard-coded',
        isPublic: true,
        metaSchemas: ['collections_public', 'meta_public']
    },
    cdn: {
        bucketName: 'test-bucket',
        awsRegion: 'us-east-1',
        awsAccessKey: 'minioadmin',
        awsSecretKey: 'minioadmin'
    },
    deployment: {
        useTx: true,
        fast: false,
        usePlan: true,
        cache: false,
        singleModule: false
    },
    migrations: {
        codegen: {
            useTx: false
        }
    }
};

/**
 * Retrieves Git configuration information (username and email) from global Git config
 * @returns Object containing Git username and email
 * @throws Error if Git config cannot be retrieved
 */
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

  try {
    const username = execSync('git config --global user.name', {
      encoding: 'utf8'
    }).trim();
    const email = execSync('git config --global user.email', {
      encoding: 'utf8'
    }).trim();

    return { username, email };
  } catch {
    throw new Error('Failed to retrieve global git config. Ensure git is configured.');
  }
}
