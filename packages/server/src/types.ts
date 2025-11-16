export interface CorsModuleData {
  urls: string[];
}

export interface PublicKeyChallengeData {
  schema: string;
  crypto_network: string;
  sign_up_with_key: string;
  sign_in_request_challenge: string;
  sign_in_record_failure: string;
  sign_in_with_challenge: string;
}

export interface GenericModuleData {
  [key: string]: any;
}

export type ApiModule =
  | { name: 'cors'; data: CorsModuleData }
  | { name: 'pubkey_challenge'; data: PublicKeyChallengeData }
  | { name: string; data?: GenericModuleData };

export interface RlsModule {
  authenticate?: string;
  authenticateStrict?: string;
  privateSchema: {
    schemaName: string;
  };
}

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
export interface ApiModuleNodes {
  nodes: ApiModule[];
}

export interface Database {
  sites: SiteNodes;
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
