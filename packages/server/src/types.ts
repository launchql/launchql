import { ApiModule, RlsModule } from '@launchql/types';

export interface SchemaNode {
    schemaName: string;
}

export interface SchemaNodes {
    nodes: SchemaNode[];
}

export interface Domain {
    subdomain?: string;
    domain: string;
}

export interface DomainNodes {
    nodes: Domain[];
}

export interface Site {
    domains: DomainNodes;
}

export interface SiteNodes {
    nodes: Site[];
}

export interface Database {
    sites: SiteNodes;
}

export interface ApiModuleNode {
    name: string;
    data?: any;
}

export interface ApiModuleNodes {
    nodes: ApiModuleNode[];
}

export interface OldApiStructure {
    dbname: string;
    anonRole: string;
    roleName: string;
    schemaNames: SchemaNodes;
    schemaNamesFromExt: SchemaNodes;
    apiModules: ApiModuleNodes;
    rlsModule?: RlsModule;
    database?: Database;
    databaseId?: string;
    isPublic?: boolean;
}

export interface ServiceData {
    api: OldApiStructure;
}

export interface Service {
    data: ServiceData;
}

export interface ApiStructure {
    dbname: string;
    anonRole: string;
    roleName: string;
    schema: string[];
    apiModules: ApiModule[];
    rlsModule?: RlsModule;
    domains?: string[];
    databaseId?: string;
    isPublic?: boolean;
}
