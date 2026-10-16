/**
 * The `file_ref_field` registry: which storage module and bucket a managed
 * document column writes into.
 *
 * An `image`/`upload` column is a projection of a files row, and the decision of
 * *where* those bytes live is a property of the field declaration, not of the
 * request. The registry records that intent per (table, column) — a storage
 * module plus either a logical bucket key, a tag selector, or nothing at all
 * (meaning the reserved default tag for the declared publicness).
 *
 * This module answers one question — "what does a write to this column bind
 * to?" — and answers it loudly: an unregistered column raises rather than
 * falling back to a server-global bucket, because a silent fallback is how the
 * unmanaged lane produced objects no tenant owned.
 */

import { Logger } from '@pgpmjs/logger';
import { LRUCache } from 'lru-cache';

const log = new Logger('graphile-presigned-url:file-ref-registry');

const FIVE_MINUTES_MS = 1000 * 60 * 5;
const ONE_HOUR_MS = 1000 * 60 * 60;

/**
 * A field's recorded storage intent.
 *
 * `bucketKey` and `bucketTags` are mutually exclusive by table constraint, and
 * both may be absent — resolution then uses the reserved default tag for
 * `isPublic`. Nothing here is a physical bucket name or id: the concrete bucket
 * is resolved per written row, inside the tenant.
 */
export interface FileRefFieldBinding {
  id: string;
  storageModuleId: string;
  bucketKey: string | null;
  bucketTags: string[] | null;
  isPublic: boolean | null;
  enforceFk: boolean;
}

/**
 * Resolve the registry row for a document column.
 *
 * Joined through metaschema rather than keyed by name, because the registry
 * records field *ids*: the physical (schema, table, column) triple is what the
 * GraphQL layer knows, and metaschema is the only thing that maps one to the
 * other.
 */
const FILE_REF_FIELD_QUERY = `
  SELECT * FROM function_resolution.storage_file_ref_field($1, $2, $3)
`;

interface FileRefFieldRow {
  id: string;
  storage_module_id: string;
  bucket_key: string | null;
  bucket_tags: string[] | null;
  is_public: boolean | null;
  enforce_fk: boolean;
}

/**
 * LRU cache of field bindings.
 *
 * A binding is schema, not data: it changes only when a database is
 * re-provisioned, so it caches on the same terms as the storage module config
 * next to it. Misses are never cached — an unregistered column is a hard error
 * every time it is written, not a remembered "no".
 */
const bindingCache = new LRUCache<string, FileRefFieldBinding>({
  max: 500,
  ttl: process.env.NODE_ENV === 'development' ? FIVE_MINUTES_MS : ONE_HOUR_MS,
  updateAgeOnGet: true,
});

export class FileRefFieldNotRegisteredError extends Error {
  constructor(
    public readonly databaseId: string,
    public readonly schemaName: string,
    public readonly tableName: string,
    public readonly columnName: string,
  ) {
    super(
      `FILE_REF_FIELD_NOT_REGISTERED: ${schemaName}.${tableName}.${columnName} ` +
      `is not a registered file-reference field in database ${databaseId}. ` +
      'A managed upload needs the declared storage module and bucket intent; ' +
      'there is no server-global bucket to fall back to.',
    );
    this.name = 'FileRefFieldNotRegisteredError';
  }
}

/**
 * Look up the storage binding for a document column, or throw.
 *
 * The read runs on the request's own lane, through the claim-scoped
 * function_resolution.storage_file_ref_field(): the database is the request's
 * jwt.claims.database_id, never an argument.
 */
export async function getFileRefFieldBinding(
  pgClient: { query: (opts: { text: string; values?: unknown[] }) => Promise<{ rows: unknown[] }> },
  databaseId: string,
  field: { schemaName: string; tableName: string; columnName: string },
): Promise<FileRefFieldBinding> {
  const cacheKey = `file-ref:${databaseId}:${field.schemaName}.${field.tableName}.${field.columnName}`;
  const cached = bindingCache.get(cacheKey);
  if (cached) return cached;

  const result = await pgClient.query({
    text: FILE_REF_FIELD_QUERY,
    values: [field.schemaName, field.tableName, field.columnName],
  });

  if (result.rows.length === 0) {
    throw new FileRefFieldNotRegisteredError(
      databaseId,
      field.schemaName,
      field.tableName,
      field.columnName,
    );
  }

  const row = result.rows[0] as FileRefFieldRow;
  const binding: FileRefFieldBinding = {
    id: row.id,
    storageModuleId: row.storage_module_id,
    bucketKey: row.bucket_key,
    bucketTags: row.bucket_tags,
    isPublic: row.is_public,
    enforceFk: row.enforce_fk,
  };

  bindingCache.set(cacheKey, binding);
  log.debug(
    `Bound ${field.schemaName}.${field.tableName}.${field.columnName} to storage module ` +
    `${binding.storageModuleId} (bucket_key=${binding.bucketKey ?? '<default tag>'})`,
  );

  return binding;
}

/**
 * Drop cached bindings. Used by tests and after a re-provision.
 */
export function clearFileRefFieldCache(): void {
  bindingCache.clear();
}
