import type { Request } from 'express';

import { ApiModule } from "../types";

export type LaunchQLAPIToken = {
    id: string;
    user_id: string;
    [key: string]: any;
};

declare global {
    namespace Express {
        interface Request {
            api?: {
                dbname: string;
                anonRole: string;
                roleName: string;
                schema: string[];  // Pre-processed schema names
                apiModules: ApiModule[];
                rlsModule?: {
                    authenticate?: string;
                    authenticateStrict?: string;
                    privateSchema: {
                        schemaName: string;
                    };
                };
                domains?: string[];  // Simplified from database.sites.nodes
                databaseId?: string;
                isPublic?: boolean;
            };
            svc_key?: string;
            clientIp?: string;
            databaseId?: string;
            token?: LaunchQLAPIToken;
        }
    }
}