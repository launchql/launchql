import '../augmentations';

import { sideEffectWithPgClient } from '@dataplan/pg';
import { QuoteUtils } from '@pgsql/quotes';
import type { GraphileConfig } from 'graphile-config';
import type { GraphQLInputType, GraphQLOutputType } from 'graphql';

import type { NestedRelationInfo } from '../utils/relations';
import { discoverNestedRelations } from '../utils/relations';
import type { ColumnSpec } from '../utils/sql-builder';
import { buildBulkInsertSQL } from '../utils/sql-builder';

const version = '0.1.0';

/**
 * BulkInsertPlugin
 *
 * Registers `bulkCreateX` mutation fields on the root mutation type for
 * each resource that has the `bulkInsert` behavior.
 *
 * Uses `sideEffectWithPgClient` for raw SQL execution. The mutation
 * SQL uses `RETURNING <pk_columns>` (not `RETURNING *`) to respect
 * column-level SELECT grants. A follow-up SELECT retrieves the full
 * rows using only the returned PKs, ensuring the query runs through
 * the normal grant-aware pipeline.
 *
 * When `bulkRelational` is enabled, nested child records are detected
 * in the input and inserted in a layered fashion: parent rows first,
 * then child rows with FK values auto-populated from the parent PKs.
 *
 * Pattern from: https://github.com/pyramation/graphile-column-privileges-mutations
 */
export const BulkInsertPlugin: GraphileConfig.Plugin = {
  name: 'BulkInsertPlugin',
  version,
  description: 'Adds bulk insert (bulkCreateX) mutations',
  after: ['BulkTypesPlugin'],

  schema: {
    hooks: {
      GraphQLObjectType_fields(fields, build, context) {
        const {
          scope: { isRootMutation }
        } = context;
        if (!isRootMutation) return fields;

        const {
          inflection,
          sql,
          graphql: { GraphQLNonNull },
          options: {
            bulkInsert: enableInsert = true,
            bulkRelational: enableRelational = false,
            bulkMaxRows = 1000
          }
        } = build;

        if (!enableInsert) return fields;

        const pgRegistry = build.input.pgRegistry;
        for (const [resourceName, resource] of Object.entries(
          pgRegistry.pgResources
        ) as [string, any][]) {
          if (resource.parameters) continue;
          if (!resource.codec.attributes) continue;
          if (resource.codec.polymorphism) continue;
          if (resource.codec.isAnonymous) continue;
          if (!resource.uniques?.length) continue;
          if (!build.behavior.pgResourceMatches(resource, 'bulkInsert'))
            continue;

          const typeName = inflection.tableType(resource.codec);
          const fieldName = inflection.bulkInsertField(resourceName);
          const inputTypeName = inflection.bulkInsertInputType(typeName);
          const payloadTypeName = inflection.bulkInsertPayloadType(typeName);

          const inputType = build.getTypeByName(inputTypeName) as GraphQLInputType | undefined;
          const payloadType = build.getTypeByName(payloadTypeName) as GraphQLOutputType | undefined;
          if (!inputType || !payloadType) continue;

          // Pre-compute column specs for SQL generation
          const columnSpecs: ColumnSpec[] = [];
          const fieldToAttr: Record<string, string> = {};
          for (const [attrName, attr] of Object.entries(
            resource.codec.attributes
          ) as [string, any][]) {
            if (attr.extensions?.isInsertable === false) continue;
            const gqlFieldName = inflection.attribute({
              attributeName: attrName,
              codec: resource.codec
            });
            fieldToAttr[gqlFieldName] = attrName;
            columnSpecs.push({
              name: attrName,
              sqlType: sql.compile(attr.codec.sqlType).text
            });
          }

          // Extract primary key columns for RETURNING clause
          const primaryUnique = resource.uniques.find((u: any) => u.isPrimary) ?? resource.uniques[0];
          const pkColumns: string[] = primaryUnique.attributes;

          const compiledFrom = sql.compile(resource.from).text;

          // Discover nested relations at schema build time
          const nestedRelations: NestedRelationInfo[] = enableRelational
            ? discoverNestedRelations(resource, pgRegistry, inflection, sql)
            : [];
          const nestedFieldNames = new Set(
            nestedRelations.map((r) => r.fieldName)
          );

          // Capture executor for plan closure
          const executor = resource.executor;
          const maxRows = bulkMaxRows as number;

          fields = build.extend(
            fields,
            {
              [fieldName]: context.fieldWithHooks(
                { fieldName },
                {
                  description: `Bulk insert rows into ${typeName}.`,
                  type: payloadType,
                  args: {
                    input: {
                      type: new GraphQLNonNull(inputType)
                    }
                  },
                  plan(_$root: any, args: any) {
                    const $input = args.getRaw('input');
                    const $result = sideEffectWithPgClient(
                      executor,
                      $input,
                      async (pgClient: any, input: any) => {
                        const values = input.values;
                        if (!values || !Array.isArray(values) || values.length === 0) {
                          return { affectedCount: 0, returning: [] };
                        }

                        if (values.length > maxRows) {
                          throw new Error(
                            `Bulk insert exceeds maximum of ${maxRows} rows (got ${values.length})`
                          );
                        }

                        // Check for nested data
                        const hasNestedData =
                          nestedRelations.length > 0 &&
                          values.some((row: any) =>
                            nestedRelations.some(
                              (rel) =>
                                Array.isArray(row[rel.fieldName]) &&
                                row[rel.fieldName].length > 0
                            )
                          );

                        // Validate: ON CONFLICT not allowed with nested inserts
                        if (hasNestedData && input.onConflict) {
                          throw new Error(
                            'ON CONFLICT cannot be used with nested/relational inserts. ' +
                            'Remove the onConflict option or remove nested records from values.'
                          );
                        }

                        // Map GraphQL field names to SQL column names,
                        // separating parent data from nested data
                        const rows = values.map((row: any) => {
                          const mapped: Record<string, unknown> = {};
                          for (const [key, val] of Object.entries(row)) {
                            if (nestedFieldNames.has(key)) continue;
                            const attrName = fieldToAttr[key];
                            if (attrName) {
                              mapped[attrName] = val;
                            }
                          }
                          return mapped;
                        });

                        // Build ON CONFLICT clause
                        let onConflict: Parameters<typeof buildBulkInsertSQL>[4];
                        if (input.onConflict) {
                          const conflictColumns = input.onConflict.constraint
                            ? (input.onConflict.constraint as string).split(',')
                            : undefined;
                          onConflict = {
                            conflictColumns,
                            action: input.onConflict.action
                          };
                        }

                        const batches = buildBulkInsertSQL(
                          compiledFrom,
                          columnSpecs,
                          rows,
                          pkColumns,
                          onConflict
                        );

                        let totalAffected = 0;
                        const allPkRows: Record<string, unknown>[] = [];

                        for (const batch of batches) {
                          const result = await pgClient.query(
                            batch.text,
                            batch.values
                          );
                          totalAffected += result.rowCount ?? 0;
                          if (result.rows) {
                            allPkRows.push(...result.rows);
                          }
                        }

                        // Layered nested inserts: insert child rows with FK
                        // values auto-populated from parent PKs
                        if (hasNestedData) {
                          for (
                            let i = 0;
                            i < values.length && i < allPkRows.length;
                            i++
                          ) {
                            const row = values[i];
                            const parentPk = allPkRows[i];

                            for (const rel of nestedRelations) {
                              const childInputRows = row[rel.fieldName] as any[];
                              if (!childInputRows?.length) continue;

                              // Map child GraphQL fields to SQL columns
                              // and inject FK values from parent PK
                              const childRows = childInputRows.map(
                                (childRow: any) => {
                                  const mapped: Record<string, unknown> = {};
                                  for (const [key, val] of Object.entries(
                                    childRow
                                  )) {
                                    const attrName = rel.childFieldToAttr[key];
                                    if (attrName) {
                                      mapped[attrName] = val;
                                    }
                                  }
                                  // Fill FK columns from parent PK
                                  for (
                                    let j = 0;
                                    j < rel.localAttributes.length;
                                    j++
                                  ) {
                                    mapped[rel.remoteAttributes[j]] =
                                      parentPk[rel.localAttributes[j]];
                                  }
                                  return mapped;
                                }
                              );

                              const childBatches = buildBulkInsertSQL(
                                rel.childCompiledFrom,
                                rel.childColumnSpecs,
                                childRows,
                                rel.childPkColumns
                              );

                              for (const batch of childBatches) {
                                const result = await pgClient.query(
                                  batch.text,
                                  batch.values
                                );
                                totalAffected += result.rowCount ?? 0;
                              }
                            }
                          }
                        }

                        // Follow-up SELECT using PKs to respect column-level grants
                        let returning: unknown[] = [];
                        if (allPkRows.length > 0) {
                          const pkConditions = allPkRows.map((pkRow, rowIdx) => {
                            return pkColumns.map((col, colIdx) => {
                              const paramIdx = rowIdx * pkColumns.length + colIdx + 1;
                              return `${QuoteUtils.quoteIdentifier(col)} = $${paramIdx}`;
                            }).join(' AND ');
                          });
                          const whereClause = pkConditions.map((c) => `(${c})`).join(' OR ');
                          const selectParams = allPkRows.flatMap((pkRow) =>
                            pkColumns.map((col) => pkRow[col])
                          );
                          const selectResult = await pgClient.query(
                            `SELECT * FROM ${compiledFrom} WHERE ${whereClause}`,
                            selectParams
                          );
                          returning = selectResult.rows || [];
                        }

                        return {
                          affectedCount: totalAffected,
                          returning
                        };
                      }
                    );
                    return $result;
                  }
                }
              )
            },
            `Adding bulk insert field for ${typeName}`
          );
        }

        return fields;
      }
    }
  }
};
