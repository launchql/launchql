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


export interface PostgresOptions {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
}

export interface LaunchQLOptions {
    pg?: PostgresOptions;
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
        metaSchemas: [],
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



export const getMergedOptions = (options: LaunchQLOptions): LaunchQLOptions => {
    options = deepmerge(launchqlDefaults, options ?? {});
    // if you need to sanitize...
    return options;
};
