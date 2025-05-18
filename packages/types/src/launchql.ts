import deepmerge from "deepmerge";
import { PostGraphileOptions } from 'postgraphile';
import type { Plugin } from 'graphile-build';

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

export interface TestConnectionOptions {
    rootDb?: string;
    template?: string;
    prefix?: string;
    extensions?: string[];
    cwd?: string;
    deployFast?: boolean;
    connection?: {
      user?: string;
      password?: string;
      role?: string;
    }
  }

export interface LaunchQLOptions {
    db?: Partial<TestConnectionOptions>;
    pg?: Partial<PgConfig>;
    graphile?: {
        isPublic?: boolean;
        schema?: string | string[];
        metaSchemas?: string[];
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
        deployFast: true,
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
        isPublic: true,
        schema: ['public'],
        // TODO how to handle metaSchemas...?
        metaSchemas: ['collections_public', 'meta_public'],
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
        postgis: true,
    },
    cdn: {
        bucketName: 'test-bucket',
        awsRegion: 'us-east-1',
        awsAccessKey: 'minioadmin',
        awsSecretKey: 'minioadmin'
    }
};