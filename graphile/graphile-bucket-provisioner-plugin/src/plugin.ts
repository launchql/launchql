/**
 * Bucket Provisioner Plugin for PostGraphile v5
 *
 * Adds S3 bucket provisioning support to PostGraphile v5:
 *
 * 1. `provisionBucket` mutation — explicitly request reconciliation for a
 *    logical bucket row in the database. Stamps the bucket's
 *    `provision_requested_at` via RLS; the bucket's own job trigger then
 *    queues the same storage reconciler job used on INSERT.
 *
 * Detection: Uses the `@storageBuckets` smart tag on the codec (table).
 * The storage module generator in constructive-db sets this tag on the
 * generated buckets table via a smart comment:
 *   COMMENT ON TABLE buckets IS E'@storageBuckets\nStorage buckets table';
 */

import { QuoteUtils } from '@pgsql/quotes';
import { context as grafastContext, lambda, object } from 'grafast';
import type { GraphileConfig } from 'graphile-config';
import { extendSchema, gql } from 'graphile-utils';

// --- Storage module queries ---

/**
 * Resolve ALL storage modules for a database (for bucket-key and ownerId-based
 * resolution in the explicit provisionBucket mutation).
 */
const ALL_STORAGE_MODULES_QUERY = `
  SELECT * FROM function_resolution.storage_modules()
`;

interface StorageModuleRow {
  id: string;
  database_id: string;
  buckets_table_id: string;
  scope: string;
  entity_field: string | null;
  entity_table_id: string | null;
  buckets_schema: string;
  buckets_table: string;
  private_schema: string;
  allowed_origins: string[] | null;
  entity_schema?: string | null;
  entity_table?: string | null;
}

/**
 * Run a query against a grafast `withPgClient` client.
 *
 * That client's `query` takes the `{ text, values }` object form (the same
 * shape the presigned-url plugin uses) — NOT node-pg's positional
 * `(text, params)` args, which surface as "A query must have either text or a
 * name" at runtime.
 */
function runQuery(
  pgClient: any,
  text: string,
  values?: unknown[],
): Promise<{ rows: any[] }> {
  return pgClient.query(values === undefined ? { text } : { text, values });
}

function scopeKeySelect(storageModule: StorageModuleRow): string {
  return storageModule.entity_field === null
    ? ''
    : `, ${QuoteUtils.quoteIdentifier(storageModule.entity_field)} AS scope_key`;
}

function scopeKeyColumn(storageModule: StorageModuleRow): string {
  if (storageModule.entity_field === null) {
    throw new Error(
      `STORAGE_BUCKET_SCOPE_KEY_MISSING: storage module ${storageModule.id} has no entity field`,
    );
  }
  return QuoteUtils.quoteIdentifier(storageModule.entity_field);
}

/**
 * The explicit provisionBucket mutation's resolution: find the plane that
 * actually holds the named bucket row.
 *
 * With an ownerId, the owning entity row names the plane (probed through each
 * entity-keyed module's recorded entity table). Without one, every
 * non-entity-keyed plane's buckets table is probed for the key under RLS —
 * exactly one plane may hold it; several is ambiguous and throws rather than
 * silently picking.
 */
async function resolveBucketByKey(
  pgClient: any,
  databaseId: string,
  bucketKey: string,
  ownerId?: string,
): Promise<{ storageModule: StorageModuleRow; bucket: BucketRow } | null> {
  const result = await runQuery(pgClient, ALL_STORAGE_MODULES_QUERY);
  const modules = result.rows as StorageModuleRow[];

  if (modules.length === 0) {
    throw new Error(
      `STORAGE_MODULE_NOT_PROVISIONED: database ${databaseId} has no storage modules`,
    );
  }

  if (ownerId) {
    const entityModules = modules.filter((m) => m.entity_table_id !== null && m.entity_schema && m.entity_table);
    for (const mod of entityModules) {
      const entityTable = QuoteUtils.quoteQualifiedIdentifier(mod.entity_schema!, mod.entity_table!);
      const probe = await runQuery(
        pgClient,
        `SELECT 1 FROM ${entityTable} WHERE id = $1 LIMIT 1`,
        [ownerId],
      );
      if (probe.rows.length === 0) continue;

      const bucketsTable = QuoteUtils.quoteQualifiedIdentifier(mod.buckets_schema, mod.buckets_table);
      const bucketResult = await runQuery(
        pgClient,
        `SELECT id, key, type, is_public, allowed_origins, physical_name${scopeKeySelect(mod)}
         FROM ${bucketsTable}
         WHERE key = $1 AND ${scopeKeyColumn(mod)} = $2
         LIMIT 1`,
        [bucketKey, ownerId],
      );
      if (bucketResult.rows.length === 0) return null;
      return { storageModule: mod, bucket: bucketResult.rows[0] as BucketRow };
    }
    return null;
  }

  const matches: { storageModule: StorageModuleRow; bucket: BucketRow }[] = [];
  for (const mod of modules.filter((m) => m.entity_table_id === null)) {
    const bucketsTable = QuoteUtils.quoteQualifiedIdentifier(mod.buckets_schema, mod.buckets_table);
    const bucketResult = await runQuery(
      pgClient,
      `SELECT id, key, type, is_public, allowed_origins, physical_name${scopeKeySelect(mod)}
       FROM ${bucketsTable}
       WHERE key = $1
       LIMIT 1`,
      [bucketKey],
    );
    if (bucketResult.rows.length > 0) {
      matches.push({ storageModule: mod, bucket: bucketResult.rows[0] as BucketRow });
    }
  }

  if (matches.length === 0) return null;
  if (matches.length > 1) {
    const scopes = matches.map((m) => `'${m.storageModule.scope}'`).join(', ');
    throw new Error(
      `BUCKET_KEY_AMBIGUOUS: bucket key "${bucketKey}" exists in ${matches.length} storage planes ` +
      `(scopes ${scopes}); provide an ownerId or use a plane-unique key`,
    );
  }
  return matches[0];
}

interface BucketRow {
  id: string;
  key: string;
  physical_name: string | null;
  scope_key: string | null;
}

interface ProvisionedBucketRow {
  id: string;
  key: string;
  physical_name: string | null;
  provision_requested_at: string;
}

// --- Helpers ---

/**
 * Resolve the database_id from the JWT context.
 */
async function resolveDatabaseId(pgClient: any): Promise<string | null> {
  const result = await runQuery(
    pgClient,
    `SELECT jwt_private.current_database_id() AS id`,
  );
  return result.rows[0]?.id ?? null;
}


/**
 * Request reconciliation through the storage module's generated
 * `<private>.<buckets>_provision(bucket_id)`. It runs as the request role and
 * stamps the bucket's `provision_requested_at` under the buckets table's own
 * RLS; the bucket's UPDATE job trigger then enqueues the reconciler (keyed and
 * queued on the bucket, so repeated requests collapse into one pending job).
 * It returns the updated bucket row.
 */
async function requestReconciliation(
  pgClient: any,
  storageModule: StorageModuleRow,
  bucket: BucketRow,
): Promise<ProvisionedBucketRow> {
  const provisionFunction = QuoteUtils.quoteQualifiedIdentifier(
    storageModule.private_schema,
    `${storageModule.buckets_table}_provision`,
  );
  const result = await runQuery(
    pgClient,
    `SELECT id, key, physical_name, provision_requested_at FROM ${provisionFunction}($1::uuid)`,
    [bucket.id],
  );
  const row = result.rows[0] as ProvisionedBucketRow | undefined;
  if (!row?.id) {
    throw new Error(`STORAGE_BUCKET_PROVISION_EMPTY: bucket ${bucket.id}`);
  }
  return row;
}

// --- Plugin factory ---

/**
 * Creates the bucket provisioner plugin.
 *
 * This plugin provides one reconciliation pathway:
 *
 * 1. **Explicit `provisionBucket` mutation** — Call this mutation with a
 *    bucket key to request reconciliation (or re-reconciliation) for the
 *    bucket. Protected by RLS on the buckets table.
 *
 */
export function createBucketProvisionerPlugin(): GraphileConfig.Plugin {
  // The extendSchema plugin adds the explicit provisionBucket mutation
  const mutationPlugin = extendSchema(() => ({
    typeDefs: gql`
      input ProvisionBucketInput {
        """The logical bucket key (e.g., "public", "private")"""
        bucketKey: String!
        """
        Owner entity ID for entity-scoped bucket provisioning.
        Omit for app-level (database-wide) storage.
        """
        ownerId: UUID
      }

      type ProvisionBucketPayload {
        """The logical bucket row whose reconciliation was requested."""
        bucketId: UUID!
        bucketKey: String!
        """The physical bucket name already recorded, or null when reconciliation has not completed."""
        physicalName: String
        """When reconciliation was last requested for this bucket."""
        provisionRequestedAt: Datetime!
      }

      extend type Mutation {
        """
        Reconcile an S3 bucket for a logical bucket in the database.
        Records the request on the bucket row via RLS; the bucket's job
        trigger then enqueues the same storage:provision_bucket job used on
        INSERT, and repeated requests collapse into one pending job. This is
        idempotent for an already-reconciled bucket; failures become GraphQL
        errors.
        """
        provisionBucket(
          input: ProvisionBucketInput!
        ): ProvisionBucketPayload
      }
    `,
    plans: {
      Mutation: {
        provisionBucket(_$mutation: any, fieldArgs: any) {
          const $input = fieldArgs.getRaw('input');
          const $withPgClient = (grafastContext() as any).get('withPgClient');
          const $pgSettings = (grafastContext() as any).get('pgSettings');
          const $combined = object({
            input: $input,
            withPgClient: $withPgClient,
            pgSettings: $pgSettings,
          });

          return lambda($combined, async ({ input, withPgClient, pgSettings }: any) => {
            const { bucketKey, ownerId } = input;

            if (!bucketKey || typeof bucketKey !== 'string') {
              throw new Error('INVALID_BUCKET_KEY');
            }

            return withPgClient(pgSettings, async (pgClient: any) => {
              // Resolve database ID from JWT context
              const databaseId = await resolveDatabaseId(pgClient);
              if (!databaseId) {
                throw new Error('DATABASE_NOT_FOUND');
              }

              // Resolve the plane that actually holds the named bucket row
              // (RLS enforced via pgSettings) — never a guessed scope.
              const resolution = await resolveBucketByKey(pgClient, databaseId, bucketKey, ownerId);
              if (!resolution) {
                throw new Error('BUCKET_NOT_FOUND');
              }
              const { storageModule, bucket } = resolution;
              const provisioned = await requestReconciliation(pgClient, storageModule, bucket);

              return {
                bucketId: provisioned.id,
                bucketKey: provisioned.key,
                physicalName: provisioned.physical_name,
                provisionRequestedAt: provisioned.provision_requested_at,
              };
            });
          });
        },
      },
    },
  }));

  return mutationPlugin;
}

export const BucketProvisionerPlugin = createBucketProvisionerPlugin;
export default BucketProvisionerPlugin;
