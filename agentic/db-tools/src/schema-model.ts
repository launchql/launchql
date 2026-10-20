// The live schema of a project's app tables, read from the metaschema in one
// piece: every APP table with every field (whatever its category), keys,
// checks, foreign keys and policies. The ids are the metaschema's own, so they
// stay put across renames.

import { isInternalPolicy } from '@agentic-kit/harness';
import type { QueryResult } from '@constructive-io/graphql-query/runtime';

import type { ProjectContext } from './context';
import { errorsText, type GraphQLError } from './graphql-http';
import { columnDefault, fkAction, normalizeType, readCheck } from './schema-model/normalize';

export type ObjectCategory = 'APP' | 'AUTH' | 'CAPABILITIES' | 'CORE' | 'MEMBERSHIPS' | 'MODULE';

export type ColumnDefault =
  | { kind: 'value'; value: string | number | boolean | null }
  | { kind: 'now' }
  | { kind: 'today' }
  /** A generated id: `uuidv7()`, `gen_random_uuid()`, … */
  | { kind: 'generated'; fn: string }
  /** Anything else; a planner should leave the column's default alone. */
  | { kind: 'expression'; text: string };

export type ModelColumn = {
  id: string;
  name: string;
  /** A status column made by DataStatusField is 'MODULE'. */
  category: ObjectCategory;
  order: number;
  /** Normalised (`integer`, `timestamptz`, `email`, …) plus `[]` per array dimension. */
  type: string;
  rawType: Record<string, unknown> | null;
  isRequired: boolean;
  default: ColumnDefault | null;
  /** The values an IN-list check allows. `_meta` stays the enum source; these spot disagreement. */
  allowedValues?: string[];
  /** True when some other check (range, pattern, …) applies too. */
  hasOtherCheck?: boolean;
  isPrimaryKey: boolean;
  /** True when a single-column unique constraint covers it. */
  isUnique: boolean;
  /** An identity or generated column. */
  generated: boolean;
  label?: string;
  description?: string;
  smartTags?: Record<string, unknown>;
};

export type FkAction = 'cascade' | 'set_null' | 'restrict' | 'no_action' | 'set_default';

export type ModelForeignKey = {
  id: string;
  name?: string;
  columnIds: string[];
  columns: string[];
  targetTableId: string;
  targetTable: string;
  targetCategory: ObjectCategory | null;
  targetColumns: string[];
  onDelete: FkAction;
  onUpdate: FkAction;
};

export type ModelPolicy = {
  id: string;
  type: string;
  privilege: string;
  role: string;
  permissive: boolean;
  disabled: boolean;
  data: Record<string, unknown> | null;
  withCheck?: Record<string, unknown> | null;
};

export type TableAccess = 'shared' | 'private' | 'custom';

export type ModelTable = {
  id: string;
  name: string;
  category: ObjectCategory;
  label?: string;
  columns: ModelColumn[];
  foreignKeys: ModelForeignKey[];
  uniqueConstraints: { id: string; columns: string[] }[];
  access: TableAccess;
  /** The table's policies, internal ones left out. */
  policies: ModelPolicy[];
};

export type SchemaModel = {
  databaseId: string;
  /** The schema hash, read before anything else; null on a backend without it. */
  hash: string | null;
  /** APP tables, sorted by name. */
  tables: ModelTable[];
};

/** A read failed, so there is no model: a partial one would look like columns dropped outside. */
export class SchemaReadError extends Error {
  constructor(
    message: string,
    readonly step: string,
    readonly errors?: readonly GraphQLError[],
  ) {
    super(message);
    this.name = 'SchemaReadError';
  }
}

// ---- access ------------------------------------------------------------

const CRUD = ['select', 'insert', 'update', 'delete'];
const OWNER_FIELD = 'owner_id';

// A parameter counts only when it narrows the policy: `is_admin: false` or
// `levels: []` is the same as leaving it out.
const isSet = (value: unknown): boolean =>
  Array.isArray(value)
    ? value.length > 0
    : typeof value === 'object' && value !== null
      ? Object.keys(value).length > 0
      : Boolean(value);

function modeOf(policy: ModelPolicy): 'shared' | 'private' | null {
  if (!policy.permissive || policy.role !== 'authenticated') return null;
  if (policy.withCheck && isSet(policy.withCheck)) return null;
  const data = policy.data ?? {};
  const extras = Object.keys(data).filter((key) => key !== 'owner_field' && isSet(data[key]));
  if (extras.length > 0) return null;
  if (policy.type === 'AuthzAppMembership') return isSet(data.owner_field) ? null : 'shared';
  if (policy.type === 'AuthzAppMemberOwner') {
    const owner = data.owner_field;
    return owner === undefined || owner === null || owner === OWNER_FIELD ? 'private' : null;
  }
  return null;
}

/**
 * The access mode a table's policies amount to. `private` is the app-member
 * owner policy on `owner_id` and `shared` the plain app-membership policy,
 * each for the authenticated role over select, insert, update and delete.
 * Anything else, no policies included, is `custom`. Disabled and internal
 * policies don't count.
 */
export function accessOf(policies: readonly ModelPolicy[]): TableAccess {
  const live = policies.filter((policy) => !policy.disabled && !isInternalPolicy(policy.type));
  if (live.length === 0) return 'custom';
  const modes = new Set(live.map(modeOf));
  if (modes.size !== 1 || modes.has(null)) return 'custom';
  const covered = new Set(
    live.flatMap((policy) => {
      const privilege = (policy.privilege ?? '').toLowerCase();
      return privilege === 'all' ? CRUD : [privilege];
    }),
  );
  return CRUD.every((privilege) => covered.has(privilege)) ? [...modes][0] : 'custom';
}

// ---- reader --------------------------------------------------------------

type Executable<T> = { execute(): Promise<QueryResult<T>> };

const nodesOf = <T>(connection: { nodes?: (T | null)[] | null } | null | undefined): T[] =>
  (connection?.nodes ?? []).filter((node): node is T => Boolean(node));

async function read<T>(step: string, query: Executable<T>): Promise<T> {
  let result: QueryResult<T>;
  try {
    result = await query.execute();
  } catch (err) {
    throw new SchemaReadError(
      `Could not read ${step}: ${err instanceof Error ? err.message : String(err)}`,
      step,
    );
  }
  if (!result.ok) {
    throw new SchemaReadError(`Could not read ${step}: ${errorsText(result.errors ?? [])}`, step, result.errors);
  }
  return result.data;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const groupBy = <T extends { tableId: string }>(rows: T[]): Map<string, T[]> => {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const list = map.get(row.tableId) ?? [];
    list.push(row);
    map.set(row.tableId, list);
  }
  return map;
};

// The hash first: anything that changes the schema after this read moves it,
// so a caller comparing hashes later never trusts a model older than it looks.
async function readHash(context: ProjectContext): Promise<string | null> {
  try {
    const data = await read(
      'the database',
      context.api.database.findMany({
        select: { id: true, hash: true },
        where: { id: { equalTo: context.databaseId } },
        first: 1,
      }),
    );
    const node = nodesOf(data.databases)[0];
    if (!node) {
      throw new SchemaReadError(`Database ${context.databaseId} was not found on this backend.`, 'the database');
    }
    return node.hash ?? null;
  } catch (err) {
    // A backend from before Database.hash.
    if (err instanceof SchemaReadError && (err.errors ?? []).some((e) => /\bhash\b/.test(e?.message ?? ''))) {
      return null;
    }
    throw err;
  }
}

/**
 * Read the APP tables of the context's database. All or nothing: any failed
 * query throws `SchemaReadError`.
 */
export async function readSchemaModel(context: ProjectContext): Promise<SchemaModel> {
  const { api, databaseId } = context;
  const hash = await readHash(context);

  // Every table of the database, so a foreign key to a non-APP table (users)
  // still names its target.
  const tableData = await read(
    'tables',
    api.table.findMany({
      select: { id: true, name: true, category: true, label: true },
      where: { databaseId: { equalTo: databaseId } },
      orderBy: ['NAME_ASC'],
    }),
  );
  const allTables = nodesOf(tableData.tables);
  const tablesById = new Map(allTables.map((table) => [table.id, table]));
  const appTables = allTables
    .filter((table) => table.category === 'APP')
    .sort((a, b) => a.name.localeCompare(b.name));
  if (appTables.length === 0) return { databaseId, hash, tables: [] };

  const inApp = { tableId: { in: appTables.map((table) => table.id) } };
  const [fieldData, pkData, uniqueData, checkData, fkData, policyData] = await Promise.all([
    read(
      'fields',
      api.field.findMany({
        select: {
          id: true,
          name: true,
          tableId: true,
          category: true,
          fieldOrder: true,
          type: true,
          isRequired: true,
          defaultValue: true,
          chk: true,
          chkExpr: true,
          generationType: true,
          identityGeneration: true,
          label: true,
          description: true,
          smartTags: true,
        },
        where: inApp,
      }),
    ),
    read(
      'primary keys',
      api.primaryKeyConstraint.findMany({
        select: { id: true, tableId: true, fieldIds: true },
        where: inApp,
      }),
    ),
    read(
      'unique constraints',
      api.uniqueConstraint.findMany({
        select: { id: true, tableId: true, fieldIds: true },
        where: inApp,
      }),
    ),
    read(
      'check constraints',
      api.checkConstraint.findMany({
        select: { id: true, tableId: true, fieldIds: true, expr: true },
        where: inApp,
      }),
    ),
    read(
      'foreign keys',
      api.foreignKeyConstraint.findMany({
        select: {
          id: true,
          name: true,
          tableId: true,
          fieldIds: true,
          refTableId: true,
          refFieldIds: true,
          deleteAction: true,
          updateAction: true,
        },
        where: inApp,
      }),
    ),
    read(
      'policies',
      api.policy.findMany({
        select: {
          id: true,
          tableId: true,
          policyType: true,
          privilege: true,
          granteeName: true,
          permissive: true,
          disabled: true,
          data: true,
          withCheck: true,
        },
        where: inApp,
      }),
    ),
  ]);

  const fields = nodesOf(fieldData.fields);
  const fieldNames = new Map(fields.map((field) => [field.id, field.name]));
  const foreignKeys = nodesOf(fkData.foreignKeyConstraints);

  // Columns a foreign key points at outside the APP tables (users.id).
  const outside = [
    ...new Set(foreignKeys.flatMap((fk) => fk.refFieldIds ?? []).filter((id) => !fieldNames.has(id))),
  ];
  if (outside.length > 0) {
    const refData = await read(
      'referenced fields',
      api.field.findMany({
        select: { id: true, name: true },
        where: { id: { in: outside } },
      }),
    );
    for (const field of nodesOf(refData.fields)) fieldNames.set(field.id, field.name);
  }

  const fieldsByTable = groupBy(fields);
  const pksByTable = groupBy(nodesOf(pkData.primaryKeyConstraints));
  const uniquesByTable = groupBy(nodesOf(uniqueData.uniqueConstraints));
  const checksByTable = groupBy(nodesOf(checkData.checkConstraints));
  const fksByTable = groupBy(foreignKeys);
  const policiesByTable = groupBy(nodesOf(policyData.policies));
  const names = (ids: string[] | null | undefined) => (ids ?? []).map((id) => fieldNames.get(id) ?? id);

  const tables = appTables.map((table): ModelTable => {
    const pkIds = new Set((pksByTable.get(table.id) ?? []).flatMap((pk) => pk.fieldIds ?? []));
    const uniques = uniquesByTable.get(table.id) ?? [];
    const uniqueIds = new Set(
      uniques.filter((u) => (u.fieldIds ?? []).length === 1).map((u) => (u.fieldIds ?? [])[0]),
    );
    const checks = checksByTable.get(table.id) ?? [];

    const columns = (fieldsByTable.get(table.id) ?? [])
      .map((field, index): ModelColumn => {
        const chk = asRecord(field.chk);
        const sources = [
          chk && 'expression' in chk ? chk.expression : field.chk,
          field.chkExpr,
          ...checks.filter((c) => (c.fieldIds ?? []).length === 1 && c.fieldIds[0] === field.id).map((c) => c.expr),
        ].map(readCheck);
        const allowedValues = sources.find((source) => source.values)?.values;
        const hasOtherCheck = sources.some((source) => source.other);
        return {
          id: field.id,
          name: field.name,
          category: field.category,
          order: typeof field.fieldOrder === 'number' ? field.fieldOrder : index,
          type: normalizeType(field.type),
          rawType: asRecord(field.type),
          isRequired: Boolean(field.isRequired),
          default: columnDefault(field.defaultValue),
          ...(allowedValues ? { allowedValues } : {}),
          ...(hasOtherCheck ? { hasOtherCheck } : {}),
          isPrimaryKey: pkIds.has(field.id),
          isUnique: uniqueIds.has(field.id),
          generated: Boolean(field.generationType || field.identityGeneration),
          ...(field.label ? { label: field.label } : {}),
          ...(field.description ? { description: field.description } : {}),
          ...(field.smartTags ? { smartTags: field.smartTags } : {}),
        };
      })
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    const policies = (policiesByTable.get(table.id) ?? [])
      .filter((policy) => !isInternalPolicy(policy.policyType))
      .map(
        (policy): ModelPolicy => ({
          id: policy.id,
          type: policy.policyType ?? '',
          privilege: (policy.privilege ?? '').toLowerCase(),
          role: policy.granteeName ?? '',
          permissive: policy.permissive !== false,
          disabled: policy.disabled === true,
          data: asRecord(policy.data),
          withCheck: asRecord(policy.withCheck),
        }),
      );

    return {
      id: table.id,
      name: table.name,
      category: table.category,
      ...(table.label ? { label: table.label } : {}),
      columns,
      foreignKeys: (fksByTable.get(table.id) ?? []).map((fk): ModelForeignKey => {
        const target = fk.refTableId ? tablesById.get(fk.refTableId) : undefined;
        return {
          id: fk.id,
          ...(fk.name ? { name: fk.name } : {}),
          columnIds: fk.fieldIds ?? [],
          columns: names(fk.fieldIds),
          targetTableId: fk.refTableId ?? '',
          targetTable: target?.name ?? '',
          targetCategory: target?.category ?? null,
          targetColumns: names(fk.refFieldIds),
          onDelete: fkAction(fk.deleteAction),
          onUpdate: fkAction(fk.updateAction),
        };
      }),
      uniqueConstraints: uniques.map((u) => ({ id: u.id, columns: names(u.fieldIds) })),
      access: accessOf(policies),
      policies,
    };
  });

  return { databaseId, hash, tables };
}
