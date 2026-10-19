import { getNamedType } from 'graphql';

import { getFieldContainerType } from './graphql-schema-utils';
import { resolveTableType } from './name-meta-builders';
import type { BuildContext } from './table-meta-context';
import type { PgCodec } from './types';

/**
 * The columns a table exposes as GraphQL fields in the final schema, mapped to
 * each field's output type name. A column is exposed when its select behavior
 * holds, the table's output type has a field under its inflected name, and
 * that field's type is the one registered for the column's codec. A table whose
 * output type isn't in the schema exposes nothing.
 *
 * Without a final schema (registry-only builds) every column counts, with a
 * null type name. Everything `_meta` adds about columns goes through this, so
 * a column hidden from the API contributes nothing anywhere.
 */
export function exposedColumns(
  codec: PgCodec,
  context: BuildContext,
): Map<string, string | null> {
  const cache = (context.exposedColumns ??= new Map());
  const cached = cache.get(codec);
  if (cached) return cached;

  const columns = new Map<string, string | null>();
  cache.set(codec, columns);
  const attributes = codec.attributes ?? {};
  if (!context.schema) {
    for (const attrName of Object.keys(attributes)) columns.set(attrName, null);
    return columns;
  }

  const tableType = getFieldContainerType(
    context.schema,
    resolveTableType(context.build, codec),
  );
  if (!tableType) return columns;
  const build = context.build;
  const finalFields = tableType.getFields();

  for (const [attrName, attr] of Object.entries(attributes)) {
    if (
      build.behavior?.pgCodecAttributeMatches &&
      !build.behavior.pgCodecAttributeMatches([codec, attrName], 'attribute:select')
    ) {
      continue;
    }
    const finalField = finalFields[context.inflectAttr(attrName, codec)];
    if (!finalField) continue;

    const finalTypeName = getNamedType(finalField.type).name;
    const codecForLookup = attr.codec?.arrayOfCodec || attr.codec;
    const registeredTypeName =
      codecForLookup && build.hasGraphQLTypeForPgCodec?.(codecForLookup, 'output')
        ? build.getGraphQLTypeNameByPgCodec?.(codecForLookup, 'output')
        : null;
    if (registeredTypeName && registeredTypeName !== finalTypeName) continue;
    columns.set(attrName, finalTypeName);
  }
  return columns;
}
