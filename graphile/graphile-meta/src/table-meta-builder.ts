import {
  getNamedType,
  type GraphQLInputObjectType,
  type GraphQLSchema,
  isInputObjectType,
  isNonNullType
} from 'graphql';

import {
  buildForeignKeyConstraints,
  buildIndexes,
  buildPrimaryKey,
  buildUniqueConstraints
} from './constraint-meta-builders';
import { exposedColumns } from './exposure';
import { getFieldContainerType } from './graphql-schema-utils';
import { safeInflection } from './inflection-utils';
import { indexJunctions } from './junction-meta-builders';
import { buildInflectionMeta, buildQueryMeta, resolveTableType } from './name-meta-builders';
import {
  buildBelongsToRelations,
  buildManyToManyRelations,
  buildReverseRelations
} from './relation-meta-builders';
import { buildScopeMeta } from './scope-meta-builders';
import { buildI18nMeta, buildRealtimeMeta,buildSearchMeta, buildStorageMeta } from './storage-search-meta-builders';
import {
  type BuildContext,
  createBuildContext,
  type TableResourceWithCodec
} from './table-meta-context';
import {
  getConfiguredSchemas,
  getRelations,
  getSchemaName,
  getUniques,
  isTableResource
} from './table-resource-utils';
import { buildFieldMeta, readAllowedValues } from './type-mappings';
import type {
  ConstraintsMeta,
  MetaBuild,
  PgCodec,
  QueryMeta,
  RelationsMeta,
  TableMeta
} from './types';

// The record a create or update mutation writes. `exists` is false when the
// mutation isn't in the schema; `fields` is null when it is but its record
// input can't be found under the inflected name, so writability is unknown.
type RecordInput =
  | { exists: false }
  | { exists: true; fields: ReturnType<GraphQLInputObjectType['getFields']> | null };

// The record field of the mutation's `input` argument, by the name PostGraphile
// gives it (`CreateShiftInput.shift`, `UpdateShiftInput.shiftPatch`); other
// input objects in the same input (nested writes) are never mistaken for it.
function mutationRecordInput(
  schema: GraphQLSchema,
  mutationName: string | null,
  recordFieldName: string | null
): RecordInput {
  const mutation = mutationName ? schema.getMutationType()?.getFields()[mutationName] : undefined;
  if (!mutation) return { exists: false };
  const inputArg = mutation.args.find((arg) => arg.name === 'input');
  const inputType = inputArg ? getNamedType(inputArg.type) : null;
  const recordField =
    isInputObjectType(inputType) && recordFieldName
      ? inputType.getFields()[recordFieldName]
      : undefined;
  const record = recordField ? getNamedType(recordField.type) : null;
  return { exists: true, fields: isInputObjectType(record) ? record.getFields() : null };
}

function resolveWriteInputs(
  schema: GraphQLSchema,
  query: QueryMeta,
  resource: TableResourceWithCodec,
  build: MetaBuild
) {
  const tableFieldName = safeInflection(() => build.inflection.tableFieldName?.(resource), null);
  const patchFieldName = tableFieldName
    ? safeInflection(() => build.inflection.patchField?.(tableFieldName), null)
    : null;
  return {
    create: mutationRecordInput(schema, query.create, tableFieldName),
    patch: mutationRecordInput(schema, query.update, patchFieldName)
  };
}

function buildTableMeta(
  resource: TableResourceWithCodec,
  schemaName: string,
  context: BuildContext
): TableMeta | null {
  const codec = resource.codec;
  const attributes = codec.attributes;
  const uniques = getUniques(resource);
  const relations = getRelations(resource);
  const tableType = resolveTableType(context.build, codec);
  const finalTableType = context.schema
    ? getFieldContainerType(context.schema, tableType)
    : null;
  if (context.schema && !finalTableType) return null;

  // Compute PK and FK attribute name sets for field metadata
  const pkAttrNames = new Set<string>();
  const fkAttrNames = new Set<string>();
  for (const unique of uniques) {
    if (unique.isPrimary) {
      for (const attrName of unique.attributes) pkAttrNames.add(attrName);
    }
  }
  for (const relation of Object.values(relations)) {
    if (relation.isReferencee) continue;
    for (const attrName of relation.localAttributes || []) fkAttrNames.add(attrName);
  }

  const query = buildQueryMeta(
    resource,
    uniques,
    tableType,
    context.build,
    context.schema
  );
  // Requiredness comes from the create input PostGraphile actually built, not
  // from NOT NULL: a trigger-filled column (`@behavior -insert`) or one with a
  // default is NOT NULL yet optional or absent there.
  const writeInputs = context.schema
    ? resolveWriteInputs(context.schema, query, resource, context.build)
    : null;

  const exposed = exposedColumns(codec, context);
  const fields = Object.entries(attributes).flatMap(([attrName, attr]) => {
    if (!exposed.has(attrName)) return [];

    const fieldName = context.inflectAttr(attrName, codec);
    const fieldMeta = buildFieldMeta(fieldName, attrName, attr, context.build, {
      isPrimaryKey: pkAttrNames.has(attrName),
      isForeignKey: fkAttrNames.has(attrName)
    });

    const finalTypeName = exposed.get(attrName);
    if (finalTypeName) fieldMeta.type.gqlType = finalTypeName;
    // Only an exposed field reports its CHECK values, so a constraint on a
    // hidden column contributes nothing.
    fieldMeta.allowedValues = readAllowedValues(attr);

    if (writeInputs) {
      const { create, patch } = writeInputs;
      const createField = create.exists ? create.fields?.[fieldName] : undefined;
      fieldMeta.isWritableOnCreate = !create.exists ? false : create.fields ? !!createField : null;
      fieldMeta.isRequiredOnCreate = !create.exists
        ? false
        : create.fields
          ? !!createField && isNonNullType(createField.type)
          : null;
      fieldMeta.isWritableOnUpdate = !patch.exists ? false : patch.fields ? !!patch.fields[fieldName] : null;
    }

    return [fieldMeta];
  });
  const indexes = buildIndexes(codec, attributes, uniques, context);
  const primaryKey = buildPrimaryKey(codec, attributes, uniques, context);
  const uniqueConstraints = buildUniqueConstraints(codec, attributes, uniques, context);
  const foreignKeyConstraints = buildForeignKeyConstraints(
    codec,
    attributes,
    relations,
    context
  );

  const constraints: ConstraintsMeta = {
    primaryKey,
    unique: uniqueConstraints,
    foreignKey: foreignKeyConstraints
  };

  const belongsTo = buildBelongsToRelations(codec, attributes, uniques, relations, context);
  const { hasOne, hasMany } = buildReverseRelations(codec, attributes, relations, context);
  const manyToMany = buildManyToManyRelations(resource, context);

  const relationsMeta: RelationsMeta = {
    belongsTo,
    has: [...hasOne, ...hasMany],
    hasOne,
    hasMany,
    manyToMany
  };

  const storage = buildStorageMeta(codec, context.build);
  const search = buildSearchMeta(codec, context.build, context.inflectAttr);
  const i18n = buildI18nMeta(codec, context.build, context.inflectAttr);
  const realtime = buildRealtimeMeta(codec, context.build);
  const scope = buildScopeMeta(codec, context.inflectAttr);

  return {
    name: tableType,
    tableName: codec.extensions?.pg?.name ?? codec.name,
    schemaName,
    fields,
    indexes,
    constraints,
    foreignKeyConstraints,
    primaryKeyConstraints: primaryKey ? [primaryKey] : [],
    uniqueConstraints,
    relations: relationsMeta,
    inflection: buildInflectionMeta(resource, tableType, context.build, query),
    query,
    storage,
    search,
    i18n,
    realtime,
    scope,
    // Settled in collectTablesMeta once every table's relations are built.
    isJunction: false
  };
}

export function collectTablesMeta(
  build: MetaBuild,
  schema?: GraphQLSchema
): TableMeta[] {
  const configuredSchemas = getConfiguredSchemas(build);
  const context = createBuildContext(build, schema);
  const seenCodecs = new Set<PgCodec>();
  const tables: { resource: TableResourceWithCodec; schemaName: string }[] = [];

  for (const resource of Object.values(build.input.pgRegistry.pgResources || {})) {
    if (!isTableResource(resource)) continue;

    const codec = resource.codec;
    if (seenCodecs.has(codec)) continue;
    seenCodecs.add(codec);

    const schemaName = getSchemaName(resource);
    if (!schemaName) continue;
    if (
      configuredSchemas.length > 0 &&
      !configuredSchemas.includes(schemaName)
    ) {
      continue;
    }

    tables.push({ resource, schemaName });
  }

  // Junctions are a property of the whole table set: a detected junction adds
  // a many-to-many relation to each of the two tables it links.
  context.junctions = indexJunctions(
    tables.map((table) => table.resource),
    context
  );
  context.emittedJunctions = new Set();

  const built: { codec: PgCodec; meta: TableMeta }[] = [];
  for (const { resource, schemaName } of tables) {
    const tableMeta = buildTableMeta(resource, schemaName, context);
    if (tableMeta) built.push({ codec: resource.codec, meta: tableMeta });
  }
  // A table is a junction exactly when a reported many-to-many relation names
  // it, so the flag says nothing the relations don't already show.
  for (const { codec, meta } of built) {
    meta.isJunction = context.emittedJunctions.has(codec);
  }
  return built.map(({ meta }) => meta);
}
