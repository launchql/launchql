import type { HarnessTool } from '@agentic-kit/harness';
import {
  buildPostGraphileCreate,
  toCamelCaseSingular,
  toCreateMutationName,
} from '@constructive-io/graphql-query/generators';
import { z } from 'zod';

import { resolveDataToken, resolveProjectContext } from '../context';
import { classifyBackendErrors, errorsText, type GraphQLError, statusAdapter } from '../graphql-http';
import { cleanTable, findMetaTable, META_QUERY, type MetaResponse } from '../records/meta';

export type AddRecordsDetails = {
  success: boolean;
  message: string;
  tableName?: string;
  columns?: string[];
  rows?: Record<string, unknown>[];
  createdCount?: number;
  asOf?: string;
  // Set when there's no valid data-plane token: the user hasn't signed into their
  // app in the Preview (or the session token expired). The renderer shows a
  // text prompt to sign in there.
  needsAuth?: boolean;
  // The app API answered ACCESS_SUSPENDED: the database is deleted or suspended.
  code?: 'database-unavailable';
};

type ToolResult = { content: { type: 'text'; text: string }[]; details: AddRecordsDetails };

function fail(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], details: { success: false, message } };
}

const UNAVAILABLE =
  "The app database is unavailable: the backend answered ACCESS_SUSPENDED, so it was deleted or is suspended. Retrying won't help until it is restored.";

function unavailable(inserted = 0): ToolResult {
  const message = inserted > 0 ? `${UNAVAILABLE} ${inserted} row(s) were inserted before it stopped.` : `${UNAVAILABLE} No rows were inserted.`;
  return {
    content: [{ type: 'text', text: message }],
    details: { success: false, message, code: 'database-unavailable', ...(inserted > 0 ? { createdCount: inserted } : {}) },
  };
}

const isSuspended = (errors: readonly GraphQLError[]) => classifyBackendErrors(errors) === 'suspended';

function needsAuth(message: string): ToolResult {
  return {
    content: [{ type: 'text', text: message }],
    details: { success: false, message, needsAuth: true },
  };
}

// Mirror @constructive-io/data's prepareCreateInput (create semantics): drop
// undefined/null/empty-string so server defaults apply; keep false/0/[]/objects.
function stripForCreate(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === '') continue;
    out[key] = value;
  }
  return out;
}

const AddRecordsZod = z.object({
  table_name: z
    .string()
    .describe('Name of the table to insert rows into (snake_case, singular or plural).'),
  records: z
    .array(z.record(z.string(), z.unknown()))
    .describe(
      'Rows to insert. Each is an object of column → value (camelCase or snake_case column names).',
    ),
});

export const addRecordsTool: HarnessTool<typeof AddRecordsZod, AddRecordsDetails> = {
  name: 'add_records',
  label: 'Add records',
  description: "Insert one or more rows into a table in the project's app database.",
  promptSnippet: 'add_records: insert rows into an existing table. Gated.',
  parameters: AddRecordsZod,
  async execute(params: z.infer<typeof AddRecordsZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd);
    if (!resolved.context) return fail(resolved.reason);
    const { dataEndpoint } = resolved.context;

    if (!dataEndpoint) {
      return fail(
        'Cannot resolve the app data endpoint (DATABASE_NAME missing from .env). Re-provision the database, then retry.',
      );
    }
    if (params.records.length === 0) return fail('No records provided.');

    const token = await resolveDataToken(resolved.context);
    if (!token.token) return needsAuth(token.reason ?? 'Sign in to the database to insert records.');

    // Keeps the status and extensions.code that the SDK adapter drops.
    const adapter = statusAdapter(dataEndpoint, { Authorization: `Bearer ${token.token}` });

    let tables;
    try {
      const meta = await adapter.execute<MetaResponse>(META_QUERY);
      if (!meta.ok) {
        if (isSuspended(meta.errors)) return unavailable();
        return fail(`Failed to read schema from the app database: ${errorsText(meta.errors)}`);
      }
      tables = (meta.data._meta?.tables ?? []).filter((t): t is NonNullable<typeof t> => Boolean(t));
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'Failed to query the app database schema.');
    }

    const rawTable = findMetaTable(tables, params.table_name);
    if (!rawTable) {
      return fail(`Table "${params.table_name}" was not found in the app database.`);
    }

    const table = cleanTable(rawTable);
    const allTables = tables.map(cleanTable);
    const mutation = buildPostGraphileCreate(table, allTables).toString();
    const mutationName = toCreateMutationName(table.name, table);
    const singularName = toCamelCaseSingular(table.name, table);

    // Constructive app tables scope rows by entityId (the owning user's id). The
    // create input requires it, but callers won't know it — backfill it with the
    // signed-in user's id from the Preview session when the table has the column
    // and the record omits it.
    const hasEntityId = table.fields.some((f) => f.name === 'entityId');

    const created: Record<string, unknown>[] = [];
    const errors: string[] = [];

    for (const record of params.records) {
      const prepared =
        hasEntityId && token.userId && record.entityId == null && record.entity_id == null
          ? { ...record, entityId: token.userId }
          : record;
      const variables = { input: { [singularName]: stripForCreate(prepared) } };
      try {
        const result = await adapter.execute<Record<string, unknown>>(mutation, variables);
        if (!result.ok) {
          if (isSuspended(result.errors)) return unavailable(created.length);
          errors.push(errorsText(result.errors));
          continue;
        }
        const payload = result.data[mutationName] as Record<string, unknown> | undefined;
        const row = (payload?.[singularName] as Record<string, unknown> | undefined) ?? {};
        created.push(row);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    if (created.length === 0) {
      return fail(`Failed to insert into "${params.table_name}": ${errors.join('; ') || 'unknown error'}`);
    }

    const columns = table.fields.map((f) => f.name);
    const message =
      errors.length > 0
        ? `Inserted ${created.length} of ${params.records.length} row(s) into ${params.table_name} (${errors.length} failed).`
        : `Inserted ${created.length} row(s) into ${params.table_name}.`;

    return {
      content: [{ type: 'text', text: message }],
      details: {
        success: true,
        message,
        tableName: rawTable.name,
        columns,
        rows: created,
        createdCount: created.length,
        asOf: new Date().toISOString(),
      },
    };
  },
};
