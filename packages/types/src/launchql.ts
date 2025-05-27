import { PostGraphileOptions } from 'postgraphile';
import type { Plugin } from 'graphile-build';
import { execSync } from 'child_process';
declare module 'express-serve-static-core' {
    interface Request {
        apiInfo: {
            data: {
                api: {
                    dbname: string;
                    anonRole: string;
                    roleName: string;
                    schemaNames: {
                        nodes: { schemaName: string }[];
                    };
                    schemaNamesFromExt: {
                        nodes: { schemaName: string }[];
                    };
                    apiModules: {
                        nodes: {
                            name: string;
                            data?: any;
                        }[];
                    };
                    rlsModule?: {
                        authenticate?: string;
                        authenticateStrict?: string;
                        privateSchema: {
                            schemaName: string;
                        };
                    };
                };
            };
        };
        svc_key: string;
        clientIp?: string;
        databaseId?: string;
        token?: {
            id: string;
            user_id: string;
            [key: string]: any;
        };
    }
}

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

export interface LaunchQLOptions {
    db?: Partial<PgTestConnectionOptions>;
    pg?: Partial<PgConfig>;
    graphile?: {
        isPublic?: boolean;
        schema?: string | string[];
        metaSchemas?: string[];
        appendPlugins?: Plugin[];
        graphileBuildOptions?: PostGraphileOptions['graphileBuildOptions'];
        overrideSettings?: Partial<PostGraphileOptions>;
        // Only used when useMetaApi is false
        anonRole?: string;
        // Only used when useMetaApi is false
        roleName?: string;
    };
    server?: {
        host?: string;
        port?: number;
        trustProxy?: boolean;
        origin?: string;
        strictAuth?: boolean;
        middleware?: {
            useMetaApi?: boolean;
            useAuth?: boolean;
            useCors?: boolean;
            useGraphile?: boolean;
            useFlush?: boolean;
            customMiddleware?: any[];
        };
    };
    features?: {
        simpleInflection?: boolean;
        oppositeBaseNames?: boolean;
        postgis?: boolean;
    };
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
    // TODO these should all be subset of postgraphile options since we do spread these when we call getSettings() in server
    graphile: {
        isPublic: true,
        schema: [],
        // meta has a ref to databaseId, hence the connection here...
        metaSchemas: ['collections_public', 'meta_public'],
        appendPlugins: [],
        overrideSettings: {},
        graphileBuildOptions: {},
        // Only used when useMetaApi is false
        anonRole: 'anonymous',
        // Only used when useMetaApi is false
        roleName: 'authenticated',        
    },
    server: {
        host: 'localhost',
        port: 3000,
        trustProxy: false,
        strictAuth: false,
        middleware: {
            useMetaApi: true,
            useAuth: true,
            useCors: true,
            useGraphile: true,
            useFlush: true,
            customMiddleware: []
        }
    },
    features: {
        simpleInflection: true,
        oppositeBaseNames: true,
        postgis: true,
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
