import type { S3Client } from '@aws-sdk/client-s3';

/**
 * Per-bucket configuration resolved from the storage_module tables.
 */
export interface BucketConfig {
  id: string;
  key: string;
  type: 'public' | 'private' | 'temp';
  is_public: boolean;
  owner_id: string | null;
  allowed_mime_types: string[] | null;
  max_file_size: number | null;
  allow_custom_keys: boolean;
  /**
   * The physical S3-compatible (RustFS, MinIO) bucket name recorded by reconciliation. NULL until
   * reconciliation completes. Once set, it is the source of truth for the
   * physical bucket — reads never reconstruct the name.
   */
  physical_name: string | null;
}

/**
 * Storage module configuration resolved from metaschema for a given database.
 */
export interface StorageModuleConfig {
  /** The metaschema storage_module row ID */
  id: string;
  /** Resolved schema.table for buckets */
  bucketsQualifiedName: string;
  /** Resolved schema.table for files */
  filesQualifiedName: string;
  /** Schema name (e.g., "app_public") */
  schemaName: string;
  /** Buckets table name */
  bucketsTableName: string;
  /** Files table name */
  filesTableName: string;
  /** Qualified generated managed-file recorder, or null when unavailable */
  recorderQualifiedName: string | null;

  // --- Scope identity ---

  /** Scope name (e.g., 'app', 'org', 'team') */
  scope: string;
  /** Entity table ID for entity-scoped storage (NULL for app-level) */
  entityTableId: string | null;
  /** Qualified entity table name for ownerId lookups (NULL for app-level) */
  entityQualifiedName: string | null;

  // --- Object-store connection: the only source of storage coordinates. ---
  // Effective values: a NULL column on this plane inherits the platform
  // database's `platform` plane row, resolved in the same cached query.

  /** S3-compatible API endpoint URL presigned URLs are signed for (NULL = AWS S3) */
  endpoint: string | null;
  /** Public URL prefix for generating download URLs */
  publicUrlPrefix: string | null;
  /** Storage provider type: 'minio', 'rustfs', 's3', 'gcs', etc. */
  provider: string | null;
  /** Object-store region */
  region: string | null;
  /** CORS allowed origins (per-database override, NULL = use global fallback) */
  allowedOrigins: string[] | null;

  // --- Per-database configurable settings ---

  /** Presigned PUT URL expiry in seconds (default: 900 = 15 min) */
  uploadUrlExpirySeconds: number;
  /** Presigned GET URL expiry in seconds (default: 3600 = 1 hour) */
  downloadUrlExpirySeconds: number;
  /** Default max file size in bytes (default: 200MB). Bucket-level max_file_size overrides this. */
  defaultMaxFileSize: number;
  /** Max filename length in characters (default: 1024) */
  maxFilenameLength: number;
  /** Cache TTL in seconds for this config entry (default: 300 dev / 3600 prod) */
  cacheTtlSeconds: number;
  /** Whether this storage module uses ltree path + path shares (determines if path column exists on files) */
  hasPathShares: boolean;
  /**
   * Whether the files table carries the confirm-upload lifecycle (`status`,
   * `promoted_at`). Only then can a row be told apart from the bytes it claims:
   * without it every row is treated as live, because there is nothing to read.
   */
  hasConfirmUpload: boolean;
  /** Whether the files table carries the versioning chain. */
  hasVersioning: boolean;
  /**
   * Whether the module is content-addressed: GC counts an object's references by
   * `(bucket_id, content_hash)` rather than by `(bucket_id, key)`.
   */
  hasContentHash: boolean;

  // --- Bulk upload limits ---

  /** Max files per requestBulkUploadUrls batch (default: 100) */
  maxBulkFiles: number;
  /** Max total size per bulk upload batch in bytes (default: 1GB) */
  maxBulkTotalSize: number;
}

/**
 * Input for the requestUploadUrl mutation.
 */
export interface RequestUploadUrlInput {
  /**
   * Logical bucket key (e.g., "public", "private").
   *
   * Optional: when omitted the database resolves its own default bucket for the
   * requested access (see `isPublic`), so a client never has to know a tenant's
   * bucket naming to upload.
   */
  bucketKey?: string;
  /**
   * Which default bucket to resolve when `bucketKey` is omitted: the public one
   * (true) or the private one (default false). Ignored when `bucketKey` is given.
   */
  isPublic?: boolean;
  /**
   * Owner entity ID for entity-scoped uploads.
   * Omit for app-level (database-wide) storage.
   * When provided, resolves the storage module for the entity type
   * that owns this entity instance (e.g., a data room ID, team ID).
   */
  ownerId?: string;
  /** SHA-256 content hash computed by the client */
  contentHash: string;
  /** MIME type of the file */
  contentType: string;
  /** File size in bytes */
  size: number;
  /** Original filename (optional, for display/Content-Disposition) */
  filename?: string;
  /**
   * Custom S3 key for the file (only allowed when bucket has allow_custom_keys=true).
   * When omitted, key defaults to contentHash (content-addressed dedup).
   * When provided, the file is stored at this key; dedup is bypassed.
   * Max 1024 chars. Must not contain path traversal (.. or leading /).
   */
  key?: string;
}

/**
 * Result of the requestUploadUrl mutation.
 */
export interface RequestUploadUrlPayload {
  /** Presigned PUT URL (null if deduplicated) */
  uploadUrl: string | null;
  /** The file ID (existing if dedup, new if fresh upload) */
  fileId: string;
  /** The S3 key */
  key: string;
  /** Whether this file was deduplicated (already exists with same hash) */
  deduplicated: boolean;
  /** Presigned URL expiry time (null if deduplicated) */
  expiresAt: string | null;
  /** ID of the previous version (set when re-uploading to an existing custom key) */
  previousVersionId: string | null;
  /**
   * The projection document to store in an `image`/`upload` column.
   *
   * Its `id` is the files row, which is what makes the column a reference the
   * server can count — storage GC will not collect an object while a registered
   * document column still names its file.
   */
  file: FileProjection;
}

/**
 * The document a managed `image`/`upload` column stores. See `./managed-upload`.
 */
export interface FileProjection {
  id: string;
  key: string;
  bucket_id: string;
  mime: string;
  size: number;
  filename?: string;
  /** @deprecated Read the files row's `downloadUrl` via `id` instead. */
  url?: string;
}

/**
 * S3 coordinates for one physical bucket, built from a resolved storage module.
 */
export interface S3Config {
  /** S3 client instance */
  client: S3Client;
  /** S3 bucket name (the actual S3 bucket, not the logical bucket key) */
  bucket: string;
  /** S3 endpoint URL (for RustFS, MinIO, or custom S3) */
  endpoint?: string;
  /** S3 region */
  region?: string;
  /** Whether to use path-style URLs (required for path-style S3-compatible storage) */
  forcePathStyle?: boolean;
  /** Public URL prefix for generating download URLs */
  publicUrlPrefix?: string;
}

/**
 * Object-store credentials. The only storage input that does not come from a
 * `storage_module` row (`STORAGE_ACCESS_KEY_ID` / `STORAGE_SECRET_ACCESS_KEY`).
 */
export interface StorageCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

/**
 * Plugin options for the presigned URL plugin.
 *
 * Only credentials: endpoint, provider, region and public URL prefix are read
 * from the resolved storage module. A getter is called on first use, so a
 * server that never touches storage never needs the credentials.
 */
export interface PresignedUrlPluginOptions {
  credentials: StorageCredentials | (() => StorageCredentials);
}
