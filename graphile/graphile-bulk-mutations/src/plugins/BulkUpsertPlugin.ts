import '../augmentations';

import { sideEffectWithPgClient } from '@dataplan/pg';
import { QuoteUtils } from '@pgsql/quotes';
import type { GraphileConfig } from 'graphile-config';
import type { GraphQLInputType, GraphQLOutputType } from 'graphql';

import type { ColumnSpec } from '../utils/sql-builder';
import { buildBulkInsertSQL } from '../utils/sql-builder';

const version = '0.1.0';

/**
 * BulkUpsertPlugin
 *
 * Registers `bulkUpsertX` mutation fields for each resource with the
 * `bulkUpsert` behavior. Uses INSERT ... ON CONFLICT DO UPDATE SET.
 *
 * Uses `RETURNING <pk_columns>` (not `RETURNING *`) + follow-up SELECT
 * to respect column-level SELECT grants.
 */
export const BulkUpsertPlugin: GraphileConfig.Plugin = {
  name: 'BulkUpsertPlugin',
  version,
  description: 'Adds bulk upsert (bulkUpsertX) mutations',
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
            bulkUpsert: enableUpsert = true,
            bulkMaxRows = 1000
          }
        } = build;

        if (!enableUpsert) return fields;

        const pgRegistry = build.input.pgRegistry;
        for (const [resourceName, resource] of Object.entries(
          pgRegistry.pgResources
        ) as [string, any][]) {
          if (resource.parameters) continue;
          if (!resource.codec.attributes) continue;
          if (resource.codec.polymorphism) continue;
          if (resource.codec.isAnonymous) continue;
          if (!resource.uniques?.length) continue;
          if (!build.behavior.pgResourceMatches(resource, 'bulkUpsert'))
            continue;

          const typeName = inflection.tableType(resource.codec);
          const fieldName = inflection.bulkUpsertField(resourceName);
          const inputTypeName = inflection.bulkUpsertInputType(typeName);
          const payloadTypeName = inflection.bulkUpsertPayloadType(typeName);

          const inputType = build.getTypeByName(inputTypeName) as GraphQLInputType | undefined;
          const payloadType = build.getTypeByName(payloadTypeName) as GraphQLOutputType | undefined;
          if (!inputType || !payloadType) continue;

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

          // Collect unique constraint attributes for excluding from updateColumns
          const uniqueAttrs = new Set<string>();
          for (const unique of resource.uniques) {
            for (const attr of unique.attributes) {
              uniqueAttrs.add(attr);
            }
          }

          // Extract primary key columns for RETURNING clause
          const primaryUnique = resource.uniques.find((u: any) => u.isPrimary) ?? resource.uniques[0];
          const pkColumns: string[] = primaryUnique.attributes;

          const compiledFrom = sql.compile(resource.from).text;

          // Capture for plan closure
          const executor = resource.executor;
          const maxRows = bulkMaxRows as number;

          fields = build.extend(
            fields,
            {
              [fieldName]: context.fieldWithHooks(
                { fieldName },
                {
                  description: `Bulk upsert rows into ${typeName}. Requires an ON CONFLICT constraint.`,
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
                            `Bulk upsert exceeds maximum of ${maxRows} rows (got ${values.length})`
                          );
                        }

                        if (!input.onConflict?.constraint) {
                          throw new Error(
                            'bulkUpsert requires onConflict.constraint'
                          );
                        }

                        const rows = values.map((row: any) => {
                          const mapped: Record<string, unknown> = {};
                          for (const [key, val] of Object.entries(row)) {
                            const attrName = fieldToAttr[key];
                            if (attrName) {
                              mapped[attrName] = val;
                            }
                          }
                          return mapped;
                        });

                        // Determine which columns to update
                        let updateColumns: string[] | undefined;
                        if (
                          input.onConflict.updateColumns &&
                          input.onConflict.updateColumns.length > 0
                        ) {
                          updateColumns = input.onConflict.updateColumns;
                        } else {
                          // Default: all non-key columns
                          updateColumns = columnSpecs
                            .map((c) => c.name)
                            .filter((n) => !uniqueAttrs.has(n));
                        }

                        const batches = buildBulkInsertSQL(
                          compiledFrom,
                          columnSpecs,
                          rows,
                          pkColumns,
                          {
                            conflictColumns: (input.onConflict.constraint as string).split(','),
                            action: 'UPDATE',
                            updateColumns
                          }
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
            `Adding bulk upsert field for ${typeName}`
          );
        }

        return fields;
      }
    }
  }
};
