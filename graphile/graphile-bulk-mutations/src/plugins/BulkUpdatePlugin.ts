import '../augmentations';

import { sideEffectWithPgClient } from '@dataplan/pg';
import { QuoteUtils } from '@pgsql/quotes';
import type { GraphileConfig } from 'graphile-config';
import type { GraphQLInputType, GraphQLOutputType } from 'graphql';

const version = '0.1.0';

/**
 * BulkUpdatePlugin
 *
 * Registers `bulkUpdateX` mutation fields for each resource with the
 * `bulkUpdate` behavior. Uses UPDATE ... SET ... WHERE with conditions
 * from graphile-connection-filter (or PostGraphile's built-in condition type).
 *
 * Uses `RETURNING <pk_columns>` (not `RETURNING *`) + follow-up SELECT
 * to respect column-level SELECT grants.
 */
export const BulkUpdatePlugin: GraphileConfig.Plugin = {
  name: 'BulkUpdatePlugin',
  version,
  description: 'Adds bulk update (bulkUpdateX) mutations',
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
            bulkUpdate: enableUpdate = true,
            bulkRequireWhere = true
          }
        } = build;

        if (!enableUpdate) return fields;

        const pgRegistry = build.input.pgRegistry;
        for (const [resourceName, resource] of Object.entries(
          pgRegistry.pgResources
        ) as [string, any][]) {
          if (resource.parameters) continue;
          if (!resource.codec.attributes) continue;
          if (resource.codec.polymorphism) continue;
          if (resource.codec.isAnonymous) continue;
          if (!resource.uniques?.length) continue;
          if (!build.behavior.pgResourceMatches(resource, 'bulkUpdate'))
            continue;

          const typeName = inflection.tableType(resource.codec);
          const fieldName = inflection.bulkUpdateField(resourceName);
          const inputTypeName = inflection.bulkUpdateInputType(typeName);
          const payloadTypeName = inflection.bulkUpdatePayloadType(typeName);

          const inputType = build.getTypeByName(inputTypeName) as GraphQLInputType | undefined;
          const payloadType = build.getTypeByName(payloadTypeName) as GraphQLOutputType | undefined;
          if (!inputType || !payloadType) continue;

          // Build field-to-attribute mapping for patch resolution
          const fieldToAttr: Record<string, string> = {};
          const attrToSqlType: Record<string, string> = {};
          for (const [attrName, attr] of Object.entries(
            resource.codec.attributes
          ) as [string, any][]) {
            const gqlFieldName = inflection.attribute({
              attributeName: attrName,
              codec: resource.codec
            });
            fieldToAttr[gqlFieldName] = attrName;
            attrToSqlType[attrName] = sql.compile(attr.codec.sqlType).text;
          }

          // Extract primary key columns for RETURNING clause
          const primaryUnique = resource.uniques.find((u: any) => u.isPrimary) ?? resource.uniques[0];
          const pkColumns: string[] = primaryUnique.attributes;
          const pkReturning = pkColumns
            .map((c) => QuoteUtils.quoteIdentifier(c))
            .join(', ');

          const compiledFrom = sql.compile(resource.from).text;

          // Capture for plan closure
          const executor = resource.executor;
          const requireWhere = bulkRequireWhere as boolean;

          fields = build.extend(
            fields,
            {
              [fieldName]: context.fieldWithHooks(
                { fieldName },
                {
                  description: `Bulk update ${typeName} rows matching the given condition.`,
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
                        if (requireWhere && (!input.where || Object.keys(input.where).length === 0)) {
                          throw new Error(
                            'Bulk update requires a non-empty where condition. Set bulkRequireWhere: false to allow unrestricted updates.'
                          );
                        }

                        if (!input.patch || Object.keys(input.patch).length === 0) {
                          throw new Error('Bulk update requires a non-empty patch.');
                        }

                        // Build SET clause from patch
                        const setClauses: string[] = [];
                        const values: unknown[] = [];
                        for (const [key, val] of Object.entries(input.patch)) {
                          if (val === undefined) continue;
                          const attrName = fieldToAttr[key];
                          if (!attrName) continue;
                          const sqlType = attrToSqlType[attrName];
                          values.push(val);
                          setClauses.push(
                            `${QuoteUtils.quoteIdentifier(attrName)} = $${values.length}::${sqlType}`
                          );
                        }

                        if (setClauses.length === 0) {
                          return { affectedCount: 0, returning: [] };
                        }

                        // Build WHERE clause from condition
                        // Supports both simple equality (Condition type: { name: "X" })
                        // and operator-based (Filter type: { name: { equalTo: "X" } })
                        const whereClauses: string[] = [];
                        if (input.where) {
                          for (const [key, spec] of Object.entries(input.where) as [string, any][]) {
                            const attrName = fieldToAttr[key];
                            if (!attrName) continue;
                            const sqlType = attrToSqlType[attrName];

                            if (spec === null) {
                              whereClauses.push(`${QuoteUtils.quoteIdentifier(attrName)} IS NULL`);
                            } else if (spec !== undefined && typeof spec !== 'object') {
                              // Simple equality (Condition type)
                              values.push(spec);
                              whereClauses.push(
                                `${QuoteUtils.quoteIdentifier(attrName)} = $${values.length}::${sqlType}`
                              );
                            } else if (spec && typeof spec === 'object') {
                              // Operator-based (Filter type)
                              for (const [op, val] of Object.entries(spec) as [string, any][]) {
                                values.push(val);
                                const paramRef = `$${values.length}::${sqlType}`;
                                switch (op) {
                                case 'equalTo':
                                  whereClauses.push(`${QuoteUtils.quoteIdentifier(attrName)} = ${paramRef}`);
                                  break;
                                case 'notEqualTo':
                                  whereClauses.push(`${QuoteUtils.quoteIdentifier(attrName)} != ${paramRef}`);
                                  break;
                                case 'greaterThan':
                                  whereClauses.push(`${QuoteUtils.quoteIdentifier(attrName)} > ${paramRef}`);
                                  break;
                                case 'greaterThanOrEqualTo':
                                  whereClauses.push(`${QuoteUtils.quoteIdentifier(attrName)} >= ${paramRef}`);
                                  break;
                                case 'lessThan':
                                  whereClauses.push(`${QuoteUtils.quoteIdentifier(attrName)} < ${paramRef}`);
                                  break;
                                case 'lessThanOrEqualTo':
                                  whereClauses.push(`${QuoteUtils.quoteIdentifier(attrName)} <= ${paramRef}`);
                                  break;
                                case 'in':
                                  if (Array.isArray(val)) {
                                    const placeholders = val.map((v: any) => {
                                      values.push(v);
                                      return `$${values.length}::${sqlType}`;
                                    });
                                    values.pop();
                                    whereClauses.push(
                                      `${QuoteUtils.quoteIdentifier(attrName)} IN (${placeholders.join(', ')})`
                                    );
                                  }
                                  break;
                                case 'isNull':
                                  values.pop();
                                  if (val) {
                                    whereClauses.push(`${QuoteUtils.quoteIdentifier(attrName)} IS NULL`);
                                  } else {
                                    whereClauses.push(`${QuoteUtils.quoteIdentifier(attrName)} IS NOT NULL`);
                                  }
                                  break;
                                default:
                                  values.pop();
                                  break;
                                }
                              }
                            }
                          }
                        }

                        if (whereClauses.length === 0 && requireWhere) {
                          throw new Error(
                            'Bulk update: no valid where conditions resolved. At least one condition is required.'
                          );
                        }

                        const whereStr = whereClauses.length > 0
                          ? whereClauses.join(' AND ')
                          : 'TRUE';

                        // Use RETURNING <pk_columns> instead of RETURNING *
                        const text = `UPDATE ${compiledFrom}\nSET ${setClauses.join(', ')}\nWHERE ${whereStr}\nRETURNING ${pkReturning}`;
                        const mutationResult = await pgClient.query(text, values);
                        const affectedCount = mutationResult.rowCount ?? 0;

                        // Follow-up SELECT using PKs to respect column-level grants
                        let returning: unknown[] = [];
                        if (mutationResult.rows && mutationResult.rows.length > 0) {
                          const pkRows: Record<string, unknown>[] = mutationResult.rows;
                          const pkConditions = pkRows.map((pkRow, rowIdx) => {
                            return pkColumns.map((col, colIdx) => {
                              const paramIdx = rowIdx * pkColumns.length + colIdx + 1;
                              return `${QuoteUtils.quoteIdentifier(col)} = $${paramIdx}`;
                            }).join(' AND ');
                          });
                          const selectWhere = pkConditions.map((c) => `(${c})`).join(' OR ');
                          const selectParams = pkRows.flatMap((pkRow) =>
                            pkColumns.map((col) => pkRow[col])
                          );
                          const selectResult = await pgClient.query(
                            `SELECT * FROM ${compiledFrom} WHERE ${selectWhere}`,
                            selectParams
                          );
                          returning = selectResult.rows || [];
                        }

                        return {
                          affectedCount,
                          returning
                        };
                      }
                    );
                    return $result;
                  }
                }
              )
            },
            `Adding bulk update field for ${typeName}`
          );
        }

        return fields;
      }
    }
  }
};
