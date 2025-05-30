import { PostGraphileOptions } from 'postgraphile';
import type { Plugin } from 'graphile-build';
import { execSync } from 'child_process';

export interface PgConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export interface PgTestConnectionOptions {
    rootDb?: string;
    template?: string;
    prefix?: string;
    extensions?: string[];
    cwd?: string;
    connection?: {
      user?: string;
      password?: string;
      role?: string;
    }
  }

export interface ApiOptions {
    enableMetaApi?: boolean;
    exposedSchemas?: string[];
    anonRole?: string;
    roleName?: string;
    defaultDatabaseId?: string;
    isPublic?: boolean;
    metaSchemas?: string[];
}

export interface LaunchQLOptions {
    db?: Partial<PgTestConnectionOptions>;
    pg?: Partial<PgConfig>;
    graphile?: {
        schema?: string | string[];
        appendPlugins?: Plugin[];
        graphileBuildOptions?: PostGraphileOptions['graphileBuildOptions'];
        overrideSettings?: Partial<PostGraphileOptions>;
    };
    server?: {
        host?: string;
        port?: number;
        trustProxy?: boolean;
        origin?: string;
        strictAuth?: boolean;
    };
    features?: {
        simpleInflection?: boolean;
        oppositeBaseNames?: boolean;
        postgis?: boolean;
    };
    api?: ApiOptions;
    cdn?: {
        bucketName?: string;
        awsRegion?: string;
        awsAccessKey?: string;
        awsSecretKey?: string;
        minioEndpoint?: string;
    };
}

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
