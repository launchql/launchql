import { exposedColumns } from './exposure';
import { getFieldContainerType } from './graphql-schema-utils';
import { buildQueryMeta, resolveTableType } from './name-meta-builders';
import type { BuildContext, TableResourceWithCodec } from './table-meta-context';
import { getRelations, getUniques, sameAttributes } from './table-resource-utils';
import type { PgCodec, PgManyToManyRelationDetails, PgRelation } from './types';

export interface JunctionIndex {
  /** Detected many-to-many relations, keyed by the codec of their left table. */
  detected: Map<PgCodec, PgManyToManyRelationDetails[]>;
}

/**
 * A column is a system column when a client never picks its value in a form:
 *
 * 1. it is a surrogate key: part of the primary key and of no foreign key (a
 *    primary key made of the two foreign keys is the classic junction, and
 *    those columns are its data);
 * 2. it has a default: generated ids, `owner_id DEFAULT current_user_id()`,
 *    `created_at`/`updated_at DEFAULT now()`;
 * 3. the create input can't set it (`@behavior -insert`), such as a column a
 *    trigger fills;
 * 4. it is the table's `@scope` key column (e.g. `entity_id`), which clients
 *    fill from context, not from a form.
 *
 * A timestamp with no default that clients write (e.g. `checked_in_at`) is
 * data, so it isn't a system column and a table carrying one isn't a junction.
 */
export function isSystemColumn(
  codec: PgCodec,
  attrName: string,
  surrogateKey: ReadonlySet<string>,
  context: BuildContext,
): boolean {
  if (surrogateKey.has(attrName)) return true;
  if (codec.attributes?.[attrName]?.hasDefault) return true;
  const matches = context.build.behavior?.pgCodecAttributeMatches;
  if (matches && !matches([codec, attrName], 'attribute:insert')) return true;
  return codec.extensions?.tags?.scopeKey === attrName;
}

// A relation hidden from the API (no select behavior) never links a junction.
function relationSelectable(relation: PgRelation, context: BuildContext): boolean {
  const matches = context.build.behavior?.pgCodecRelationMatches;
  return !matches || matches(relation, 'select');
}

/**
 * The two foreign keys of a junction table: the forward relations whose local
 * columns are all non-system and, between them, cover every non-system column
 * exactly once. Foreign keys on system columns (e.g. `owner_id` to users)
 * don't count. Null when the table isn't a junction.
 *
 * Only exposed columns take part. A column hidden from the API neither stops a
 * table from being a junction nor makes it one, so the answer never hints that
 * a hidden column exists.
 */
export function junctionForeignKeys(
  resource: TableResourceWithCodec,
  context: BuildContext,
): [string, PgRelation][] | null {
  const codec = resource.codec;
  const exposed = exposedColumns(codec, context);
  const forwardRelations = Object.entries(getRelations(resource)).filter(
    ([, relation]) =>
      !relation.isReferencee &&
      relationSelectable(relation, context) &&
      (relation.localAttributes ?? []).every((attrName) => exposed.has(attrName)),
  );
  const foreignKeyColumns = new Set(
    forwardRelations.flatMap(([, relation]) => relation.localAttributes ?? []),
  );
  const surrogateKey = new Set(
    getUniques(resource)
      .filter((unique) => unique.isPrimary)
      .flatMap((unique) => unique.attributes)
      .filter((attrName) => !foreignKeyColumns.has(attrName)),
  );
  const dataColumns = [...exposed.keys()].filter(
    (attrName) => !isSystemColumn(codec, attrName, surrogateKey, context),
  );
  if (dataColumns.length === 0) return null;

  const keys = forwardRelations.filter(
    ([, relation]) =>
      !!relation.remoteResource?.codec &&
      (relation.localAttributes?.length ?? 0) > 0 &&
      relation.localAttributes!.every((attrName) => dataColumns.includes(attrName)),
  );
  if (keys.length !== 2) return null;

  const [left, right] = keys.map(([, relation]) => relation.localAttributes!);
  if (left.some((attrName) => right.includes(attrName))) return null;
  return left.length + right.length === dataColumns.length ? keys : null;
}

/**
 * Find every junction among `resources` and the many-to-many relations it
 * implies on both of its tables. A relation is only reported when the
 * junction (with its create mutation), both linked tables, the junction's two
 * keys and every key column on either side are exposed in the final schema, so
 * it never names something the API hides.
 * Whether a GraphQL field serves it is decided later, when it is built.
 */
export function indexJunctions(
  resources: TableResourceWithCodec[],
  context: BuildContext,
): JunctionIndex {
  const detected = new Map<PgCodec, PgManyToManyRelationDetails[]>();

  const exposed = new Map(
    resources
      .filter(
        (resource) =>
          !context.schema ||
          !!getFieldContainerType(context.schema, resolveTableType(context.build, resource.codec)),
      )
      .map((resource) => [resource.codec as PgCodec, resource]),
  );

  for (const junction of resources) {
    if (!exposed.has(junction.codec)) continue;
    // A link a client can't create isn't one to offer: the junction needs its
    // create mutation in the final schema.
    if (context.schema) {
      const tableType = resolveTableType(context.build, junction.codec);
      const query = buildQueryMeta(junction, getUniques(junction), tableType, context.build, context.schema);
      if (!query.create) continue;
    }
    const keys = junctionForeignKeys(junction, context);
    if (!keys) continue;

    const sides = keys.map(([name, relation]) => {
      const table = exposed.get(relation.remoteResource!.codec!);
      const referenced = table ? exposedColumns(table.codec, context) : null;
      const visible = (relation.remoteAttributes ?? []).every((attrName) =>
        referenced?.has(attrName),
      );
      return { name, relation, table: visible ? table : undefined };
    });
    const keyColumns = keys.flatMap(([, relation]) => relation.localAttributes!);
    const allowsMultipleEdgesToNode = !getUniques(junction).some((unique) =>
      sameAttributes(unique.attributes, keyColumns),
    );

    for (const [left, right] of [
      [sides[0], sides[1]],
      [sides[1], sides[0]],
    ]) {
      if (!left.table || !right.table) continue;
      const list = detected.get(left.table.codec) ?? [];
      // The left side is named by the junction's forward key, not the left
      // table's backward relation, which the API may not expose.
      list.push({
        leftTable: left.table,
        leftRelationName: left.name,
        junctionTable: junction,
        rightRelationName: right.name,
        rightTable: right.table,
        allowsMultipleEdgesToNode,
      });
      detected.set(left.table.codec, list);
    }
  }

  return { detected };
}
