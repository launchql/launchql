/**
 * Bucket Provisioner Plugin for PostGraphile v5
 *
 * Adds S3 bucket provisioning support to PostGraphile v5:
 *
 * 1. `provisionBucket` mutation — explicitly enqueue reconciliation for a
 *    logical bucket row in the database. Reads the bucket config via RLS,
 *    then queues the same storage reconciler job used by the INSERT trigger.
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
  SELECT
    sm.id,
    sm.database_id,
    sm.buckets_table_id,
    sm.scope,
    sm.entity_field,
    sm.entity_table_id,
    bs.schema_name AS buckets_schema,
    bt.name AS buckets_table,
    sm.allowed_origins,
    es.schema_name AS entity_schema,
    et.name AS entity_table
  FROM metaschema_modules_public.storage_module sm
  JOIN metaschema_public.table bt ON bt.id = sm.buckets_table_id
  JOIN metaschema_public.schema bs ON bs.id = bt.schema_id
  LEFT JOIN metaschema_public.table et ON et.id = sm.entity_table_id
  LEFT JOIN metaschema_public.schema es ON es.id = et.schema_id
  WHERE sm.database_id = $1
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
  const result = await runQuery(pgClient, ALL_STORAGE_MODULES_QUERY, [databaseId]);
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

async function resolveEntityContext(
  pgClient: any,
  storageModule: StorageModuleRow,
): Promise<{ entity_type: string | null; get_org_fn_schema: string | null; get_org_fn: string | null }> {
  const result = await runQuery(
    pgClient,
    `SELECT r.entity_type, r.get_org_fn_schema, r.get_org_fn
     FROM metaschema.resolve_entity_context_by_field($1::uuid, $2::uuid, $3::text) r`,
    [storageModule.database_id, storageModule.buckets_table_id, storageModule.entity_field],
  );
  return result.rows[0] ?? {
    entity_type: null,
    get_org_fn_schema: null,
    get_org_fn: null,
  };
}

/**
 * Mirror the storage module generator's data_job_trigger shape from
 * `packages/metaschema-generators/deploy/schemas/metaschema_generators/procedures/storage_module.sql`
 * and the add_job argument assembly in
 * `packages/ast-plpgsql/deploy/schemas/ast_plpgsql_helpers/procedures/triggers/job_trigger.sql`.
 * A callable enqueue function beside the trigger would be the durable fix for
 * this deliberate mirroring, but is out of scope here.
 *
 * The three scope shapes differ only in the payload entries and the identity
 * arguments, so those are the only parts a caller supplies — the identifier,
 * queue, retry, and priority policy exist exactly once.
 */
function addJobStatement(payloadEntries: string, identityArgs: string): string {
  return `SELECT (app_jobs.add_job(
      identifier => 'storage:provision_bucket',
      payload => json_build_object(${payloadEntries}),
      queue_name => 'bucket:' || $1::text,
      max_attempts => 25,
      priority => 0${identityArgs}
    )).id AS id`;
}

async function enqueueReconciliationJob(
  pgClient: any,
  storageModule: StorageModuleRow,
  bucket: BucketRow,
): Promise<string> {
  const scope = storageModule.scope;
  const entityField = storageModule.entity_field;

  let text: string;
  let values: unknown[];

  if (entityField === null) {
    text = addJobStatement(
      `'id', $1::uuid,
        'scope', $2::text`,
      '',
    );
    values = [bucket.id, scope];
  } else if (entityField === 'database_id') {
    const databaseId = bucket.scope_key;
    if (!databaseId) {
      throw new Error(`STORAGE_BUCKET_SCOPE_KEY_MISSING: bucket ${bucket.id} has no database_id`);
    }
    text = addJobStatement(
      `'database_id', $2::uuid,
        'id', $1::uuid,
        'scope', $3::text`,
      `,
      db_id => $2,
      entity_id => $2,
      organization_id => NULL,
      entity_type => $3`,
    );
    values = [bucket.id, databaseId, scope];
  } else if (entityField === 'owner_id') {
    const ownerId = bucket.scope_key;
    if (!ownerId) {
      throw new Error(`STORAGE_BUCKET_SCOPE_KEY_MISSING: bucket ${bucket.id} has no owner_id`);
    }
    const context = await resolveEntityContext(pgClient, storageModule);
    const orgFunction = context.get_org_fn_schema && context.get_org_fn
      ? `${QuoteUtils.quoteQualifiedIdentifier(context.get_org_fn_schema, context.get_org_fn)}($3::text, $2::uuid)`
      : 'NULL';
    text = addJobStatement(
      `'id', $1::uuid,
        'owner_id', $2::uuid,
        'scope', $3::text`,
      `,
      entity_id => $2,
      organization_id => ${orgFunction},
      entity_type => $3`,
    );
    values = [bucket.id, ownerId, scope];
  } else {
    throw new Error(
      `STORAGE_BUCKET_ENTITY_FIELD_UNSUPPORTED: ${entityField}`,
    );
  }

  const result = await runQuery(pgClient, text, values);
  const jobId = result.rows[0]?.id;
  if (!jobId) {
    throw new Error(`STORAGE_BUCKET_JOB_ID_MISSING: bucket ${bucket.id}`);
  }
  return jobId;
}

// --- Plugin factory ---

/**
 * Creates the bucket provisioner plugin.
 *
 * This plugin provides one reconciliation pathway:
 *
 * 1. **Explicit `provisionBucket` mutation** — Call this mutation with a
 *    bucket key to enqueue reconciliation (or re-reconciliation) for the
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
        """The logical bucket row that was queued for reconciliation."""
        bucketId: UUID!
        bucketKey: String!
        """The physical bucket name already recorded, or null when reconciliation has not completed."""
        physicalName: String
        """The reconciler job enqueued to provision this bucket."""
        jobId: UUID!
      }

      extend type Mutation {
        """
        Reconcile an S3 bucket for a logical bucket in the database.
        Reads the bucket config via RLS, then enqueues the same
        storage:provision_bucket job used by the INSERT trigger. This is
        idempotent for an already-reconciled bucket; enqueue failures become
        GraphQL errors.
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
              const jobId = await enqueueReconciliationJob(pgClient, storageModule, bucket);

              return {
                bucketId: bucket.id,
                bucketKey: bucket.key,
                physicalName: bucket.physical_name,
                jobId,
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
