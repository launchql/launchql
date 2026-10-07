import { Logger } from '@pgpmjs/logger';
import { QuoteUtils } from '@pgsql/quotes';
import { LRUCache } from 'lru-cache';

import type { BucketConfig,StorageModuleConfig } from './types';

const log = new Logger('graphile-presigned-url:cache');

// --- Defaults ---
const DEFAULT_UPLOAD_URL_EXPIRY_SECONDS = 900; // 15 minutes
const DEFAULT_DOWNLOAD_URL_EXPIRY_SECONDS = 3600; // 1 hour
const DEFAULT_MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const DEFAULT_MAX_FILENAME_LENGTH = 1024;
const DEFAULT_CACHE_TTL_SECONDS = process.env.NODE_ENV === 'development' ? 300 : 3600;
const DEFAULT_MAX_BULK_FILES = 100;
const DEFAULT_MAX_BULK_TOTAL_SIZE = 1073741824; // 1GB

const FIVE_MINUTES_MS = 1000 * 60 * 5;
const ONE_HOUR_MS = 1000 * 60 * 60;

/**
 * LRU cache for per-database StorageModuleConfig.
 *
 * Each PostGraphile instance serves a single database, but the presigned URL
 * plugin needs to know the generated table names (buckets, files)
 * and their schemas. This cache avoids re-querying metaschema
 * on every request.
 *
 * Pattern: same as graphile-cache's LRU with TTL-based eviction.
 */
const storageModuleCache = new LRUCache<string, StorageModuleConfig>({
  max: 50,
  ttl: process.env.NODE_ENV === 'development' ? FIVE_MINUTES_MS : ONE_HOUR_MS,
  updateAgeOnGet: true,
});

/**
 * SQL query to resolve ALL storage modules for a database, whatever their
 * scope. Returns each module with its entity table names so callers can
 * classify entity-keyed planes and resolve owners.
 *
 * Endpoint, provider and region are always the platform database's `platform`
 * plane — the only object store the deployment's STORAGE_* credentials belong
 * to — and `connection_overrides` names any a row sets differently, which
 * signing then refuses. A NULL `public_url_prefix` inherits the platform's.
 * All in this same (cached) query.
 */
const ALL_STORAGE_MODULES_QUERY = `
  SELECT
    sm.id,
    sm.scope,
    sm.entity_table_id,
    bs.schema_name AS buckets_schema,
    bt.name AS buckets_table,
    fs.schema_name AS files_schema,
    ft.name AS files_table,
    ps.schema_name AS private_schema,
    psm.endpoint AS endpoint,
    coalesce(sm.public_url_prefix, psm.public_url_prefix) AS public_url_prefix,
    psm.provider AS provider,
    psm.region AS region,
    array_remove(ARRAY[
      CASE WHEN sm.endpoint IS DISTINCT FROM psm.endpoint AND sm.endpoint IS NOT NULL THEN 'endpoint' END,
      CASE WHEN sm.provider IS DISTINCT FROM psm.provider AND sm.provider IS NOT NULL THEN 'provider' END,
      CASE WHEN sm.region IS DISTINCT FROM psm.region AND sm.region IS NOT NULL THEN 'region' END
    ], NULL) AS connection_overrides,
    sm.allowed_origins,
    sm.upload_url_expiry_seconds,
    sm.download_url_expiry_seconds,
    sm.default_max_file_size,
    sm.max_filename_length,
    sm.cache_ttl_seconds,
    sm.max_bulk_files,
    sm.max_bulk_total_size,
    sm.has_path_shares,
    sm.has_versioning,
    sm.has_content_hash,
    sm.has_confirm_upload,
    es.schema_name AS entity_schema,
    et.name AS entity_table
  FROM metaschema_modules_public.storage_module sm
  JOIN metaschema_public.table bt ON bt.id = sm.buckets_table_id
  JOIN metaschema_public.schema bs ON bs.id = bt.schema_id
  JOIN metaschema_public.table ft ON ft.id = sm.files_table_id
  JOIN metaschema_public.schema fs ON fs.id = ft.schema_id
  LEFT JOIN metaschema_public.schema ps ON ps.id = sm.private_schema_id
  LEFT JOIN metaschema_public.table et ON et.id = sm.entity_table_id
  LEFT JOIN metaschema_public.schema es ON es.id = et.schema_id
  LEFT JOIN metaschema_modules_public.storage_module psm
    ON psm.scope = 'platform'
   AND psm.key = 'default'
   AND psm.database_id = (SELECT d.id FROM metaschema_public.database d WHERE d.platform)
  WHERE sm.database_id = $1
`;

interface StorageModuleRow {
  id: string;
  scope: string;
  entity_table_id: string | null;
  buckets_schema: string;
  buckets_table: string;
  files_schema: string;
  files_table: string;
  private_schema: string | null;
  endpoint: string | null;
  public_url_prefix: string | null;
  provider: string | null;
  region: string | null;
  connection_overrides: string[] | null;
  allowed_origins: string[] | null;
  upload_url_expiry_seconds: number | null;
  download_url_expiry_seconds: number | null;
  default_max_file_size: number | null;
  max_filename_length: number | null;
  cache_ttl_seconds: number | null;
  max_bulk_files: number | null;
  max_bulk_total_size: number | null;
  has_path_shares: boolean;
  has_versioning: boolean;
  has_content_hash: boolean;
  has_confirm_upload: boolean;
  entity_schema: string | null;
  entity_table: string | null;
}

/**
 * Build a StorageModuleConfig from a raw DB row.
 */
function buildConfig(row: StorageModuleRow): StorageModuleConfig {
  const cacheTtlSeconds = row.cache_ttl_seconds ?? DEFAULT_CACHE_TTL_SECONDS;
  return {
    id: row.id,
    bucketsQualifiedName: QuoteUtils.quoteQualifiedIdentifier(row.buckets_schema, row.buckets_table),
    filesQualifiedName: QuoteUtils.quoteQualifiedIdentifier(row.files_schema, row.files_table),
    recorderQualifiedName: row.private_schema
      ? QuoteUtils.quoteQualifiedIdentifier(row.private_schema, `${row.files_table}_record_file`)
      : null,
    schemaName: row.buckets_schema,
    bucketsTableName: row.buckets_table,
    filesTableName: row.files_table,
    scope: row.scope,
    entityTableId: row.entity_table_id,
    entityQualifiedName: row.entity_schema && row.entity_table
      ? QuoteUtils.quoteQualifiedIdentifier(row.entity_schema, row.entity_table)
      : null,
    endpoint: row.endpoint,
    publicUrlPrefix: row.public_url_prefix,
    provider: row.provider,
    region: row.region,
    connectionOverrides: row.connection_overrides ?? [],
    allowedOrigins: row.allowed_origins,
    uploadUrlExpirySeconds: row.upload_url_expiry_seconds ?? DEFAULT_UPLOAD_URL_EXPIRY_SECONDS,
    downloadUrlExpirySeconds: row.download_url_expiry_seconds ?? DEFAULT_DOWNLOAD_URL_EXPIRY_SECONDS,
    defaultMaxFileSize: row.default_max_file_size ?? DEFAULT_MAX_FILE_SIZE,
    maxFilenameLength: row.max_filename_length ?? DEFAULT_MAX_FILENAME_LENGTH,
    cacheTtlSeconds,
    hasPathShares: row.has_path_shares ?? false,
    hasVersioning: row.has_versioning ?? false,
    hasContentHash: row.has_content_hash ?? false,
    hasConfirmUpload: row.has_confirm_upload ?? false,
    maxBulkFiles: row.max_bulk_files ?? DEFAULT_MAX_BULK_FILES,
    maxBulkTotalSize: row.max_bulk_total_size ?? DEFAULT_MAX_BULK_TOTAL_SIZE,
  };
}

/**
 * Resolve the storage module that owns a specific file by probing all file tables.
 *
 * Since UUIDs are globally unique, exactly one table will contain the file.
 *
 * @param pgClient - A pg client from the Graphile context
 * @param databaseId - The metaschema database UUID
 * @param fileId - The file UUID to look up
 * @returns Object with the storage config and file row, or null if not found
 */
export async function resolveStorageModuleByFileId(
  pgClient: { query: (opts: { text: string; values?: unknown[] }) => Promise<{ rows: unknown[] }> },
  databaseId: string,
  fileId: string,
): Promise<{ storageConfig: StorageModuleConfig; file: { id: string; key: string; mime_type: string; bucket_id: string } } | null> {
  // Load all storage modules for this database
  log.debug(`Resolving file ${fileId} across all storage modules for database ${databaseId}`);

  const allConfigs = (await pgClient.query({ text: ALL_STORAGE_MODULES_QUERY, values: [databaseId] })).rows.map(
    (row: unknown) => buildConfig(row as StorageModuleRow),
  );

  // Probe each module's files table for the fileId
  for (const config of allConfigs) {
    const fileResult = await pgClient.query({
      text: `SELECT id, key, mime_type, bucket_id
       FROM ${config.filesQualifiedName}
       WHERE id = $1
       LIMIT 1`,
      values: [fileId],
    });
    if (fileResult.rows.length > 0) {
      const file = fileResult.rows[0] as { id: string; key: string; mime_type: string; bucket_id: string };
      return { storageConfig: config, file };
    }
  }

  return null;
}

/**
 * Load all storage modules for a database, using the LRU cache.
 *
 * Returns an array of all StorageModuleConfig entries (app-level + entity-scoped).
 * The result is cached per-database so subsequent calls avoid the DB query.
 */
export async function loadAllStorageModules(
  pgClient: { query: (opts: { text: string; values?: unknown[] }) => Promise<{ rows: unknown[] }> },
  databaseId: string,
): Promise<StorageModuleConfig[]> {
  const cacheKey = `storage:${databaseId}:all-list`;
  const cached = storageModuleCache.get(cacheKey);
  if (cached) {
    return (cached as any)._allConfigs as StorageModuleConfig[];
  }

  log.debug(`Loading all storage modules for database ${databaseId}`);
  const result = await pgClient.query({ text: ALL_STORAGE_MODULES_QUERY, values: [databaseId] });
  const configs = (result.rows as StorageModuleRow[]).map(buildConfig);

  // Store the full list under a sentinel key (only if non-empty to avoid caching failed lookups)
  if (configs.length > 0) {
    const sentinel = { ...configs[0], _allConfigs: configs } as any;
    storageModuleCache.set(cacheKey, sentinel);
  }

  return configs;
}

/**
 * Resolve the storage module config from a PostGraphile pgCodec.
 *
 * Matches the codec's schema + table name against cached storage modules.
 * Works for both files codecs (@storageFiles) and buckets codecs (@storageBuckets).
 *
 * @param pgCodec - The PostGraphile codec (has extensions.pg.schemaName, name)
 * @param allConfigs - All storage module configs for this database
 * @returns The matching StorageModuleConfig or null
 */
export function resolveStorageConfigFromCodec(
  pgCodec: { name: string; extensions?: { pg?: { schemaName?: string; name?: string } }; sqlType?: string },
  allConfigs: StorageModuleConfig[],
): StorageModuleConfig | null {
  const schemaName = pgCodec.extensions?.pg?.schemaName;
  const tableName = pgCodec.extensions?.pg?.name ?? pgCodec.name;

  if (!schemaName || !tableName) return null;

  return allConfigs.find((c) =>
    (c.filesTableName === tableName && c.schemaName === schemaName) ||
    (c.bucketsTableName === tableName && c.schemaName === schemaName),
  ) || null;
}

// --- Bucket metadata cache ---

/**
 * LRU cache for per-database bucket metadata.
 *
 * Buckets are essentially static config — created once and rarely changed.
 * Caching avoids a DB query on every requestUploadUrl call. The bucket
 * lookup in the plugin runs under RLS, but since AuthzEntityMembership
 * grants all org members access to all org buckets, and the cached data
 * is just config (mime types, size limits), bypassing RLS on cache hits
 * is safe. The important RLS is on the files table (INSERT/UPDATE),
 * which is never cached.
 *
 * Keys: `bucket:${databaseId}:${storageModuleId}:${bucketKey}`
 * TTL: same as storage module cache (5min dev / 1hr prod)
 */
const bucketCache = new LRUCache<string, BucketConfig>({
  max: 500, // many buckets across many databases
  ttl: process.env.NODE_ENV === 'development' ? FIVE_MINUTES_MS : ONE_HOUR_MS,
  updateAgeOnGet: true,
});

/**
 * Normalize the recorded physical coordinate at the DB boundary.
 *
 * A bucket row either carries a recorded coordinate or it does not; SQL nulls
 * and absent columns both mean "never provisioned". Collapsing them here is
 * the single place that shape is interpreted — callers branch on `string`
 * vs `null` and never coalesce a bucket name into existence.
 */
export function storedPhysicalName(row: { physical_name?: string | null }): string | null {
  return row.physical_name == null ? null : row.physical_name;
}

/**
 * Resolve bucket metadata for a given database + bucket key, using the LRU cache.
 *
 * On cache miss, queries the bucket table (RLS-enforced via pgSettings on
 * the pgClient). On cache hit, returns the cached metadata directly.
 *
 * @param pgClient - A pg client from the Graphile context
 * @param storageConfig - The resolved StorageModuleConfig for this database/scope
 * @param databaseId - The metaschema database UUID (used as cache key prefix)
 * @param bucketKey - The bucket key (e.g., "public", "private")
 * @param ownerId - Optional owner entity ID for entity-scoped bucket lookup
 * @returns BucketConfig or null if the bucket doesn't exist / isn't accessible
 */
export async function getBucketConfig(
  pgClient: { query: (opts: { text: string; values?: unknown[] }) => Promise<{ rows: unknown[] }> },
  storageConfig: StorageModuleConfig,
  databaseId: string,
  bucketKey: string,
  ownerId?: string,
): Promise<BucketConfig | null> {
  const cacheKey = `bucket:${databaseId}:${storageConfig.id}:${bucketKey}${ownerId ? `:${ownerId}` : ''}`;
  const cached = bucketCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  log.debug(`Bucket cache miss for ${databaseId}:${bucketKey}${ownerId ? ` (owner=${ownerId})` : ''}, querying DB...`);

  // Entity-keyed planes (the module records an entity table) use the
  // (owner_id, key) composite lookup; app- and database-scope planes just use key.
  const isEntityScoped = storageConfig.entityTableId !== null;
  const hasOwner = ownerId && isEntityScoped;
  const result = await pgClient.query({
    text: hasOwner
      ? `SELECT id, key, type, is_public, owner_id, allowed_mime_types, max_file_size, allow_custom_keys, physical_name
         FROM ${storageConfig.bucketsQualifiedName}
         WHERE key = $1 AND owner_id = $2
         LIMIT 1`
      : `SELECT id, key, type, is_public, ${isEntityScoped ? 'owner_id,' : ''} allowed_mime_types, max_file_size, allow_custom_keys, physical_name
         FROM ${storageConfig.bucketsQualifiedName}
         WHERE key = $1
         LIMIT 1`,
    values: hasOwner ? [bucketKey, ownerId] : [bucketKey],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0] as {
    id: string;
    key: string;
    type: string;
    is_public: boolean;
    owner_id: string | null;
    allowed_mime_types: string[] | null;
    max_file_size: number | null;
    allow_custom_keys: boolean;
    physical_name: string | null;
  };

  const config: BucketConfig = {
    id: row.id,
    key: row.key,
    type: row.type as BucketConfig['type'],
    is_public: row.is_public,
    owner_id: row.owner_id ?? null,
    allowed_mime_types: row.allowed_mime_types,
    max_file_size: row.max_file_size,
    allow_custom_keys: row.allow_custom_keys ?? false,
    physical_name: storedPhysicalName(row),
  };

  bucketCache.set(cacheKey, config);
  log.debug(`Cached bucket config for ${databaseId}:${bucketKey} (id=${config.id}, scope=${storageConfig.scope})`);

  return config;
}

/**
 * Clear the storage module cache AND bucket cache.
 * Useful for testing or schema changes.
 */
export function clearStorageModuleCache(): void {
  storageModuleCache.clear();
  bucketCache.clear();
}

/**
 * Clear cached bucket entries for a specific database.
 * Useful when bucket config changes are detected.
 */
export function clearBucketCache(databaseId?: string): void {
  if (!databaseId) {
    bucketCache.clear();
    return;
  }
  // Evict all entries for this database
  const prefix = `bucket:${databaseId}:`;
  for (const key of bucketCache.keys()) {
    if (key.startsWith(prefix)) {
      bucketCache.delete(key);
    }
  }
}
