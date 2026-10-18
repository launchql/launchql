import '../augmentations';

import { sideEffectWithPgClient } from '@dataplan/pg';
import { QuoteUtils } from '@pgsql/quotes';
import type { GraphileConfig } from 'graphile-config';
import type { GraphQLInputType,GraphQLOutputType } from 'graphql';

const version = '0.1.0';

/**
 * BulkDeletePlugin
 *
 * Registers `bulkDeleteX` mutation fields for each resource with the
 * `bulkDelete` behavior. Uses DELETE ... WHERE with conditions from
 * graphile-connection-filter (or PostGraphile's built-in condition type).
 *
 * Uses `RETURNING <pk_columns>` (not `RETURNING *`) + follow-up SELECT
 * to respect column-level SELECT grants.
 */
export const BulkDeletePlugin: GraphileConfig.Plugin = {
  name: 'BulkDeletePlugin',
  version,
  description: 'Adds bulk delete (bulkDeleteX) mutations',
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
            bulkDelete: enableDelete = true,
            bulkRequireWhere = true
          }
        } = build;

        if (!enableDelete) return fields;

        const pgRegistry = build.input.pgRegistry;
        for (const [resourceName, resource] of Object.entries(
          pgRegistry.pgResources
        ) as [string, any][]) {
          if (resource.parameters) continue;
          if (!resource.codec.attributes) continue;
          if (resource.codec.polymorphism) continue;
          if (resource.codec.isAnonymous) continue;
          if (!resource.uniques?.length) continue;
          if (!build.behavior.pgResourceMatches(resource, 'bulkDelete'))
            continue;

          const typeName = inflection.tableType(resource.codec);
          const fieldName = inflection.bulkDeleteField(resourceName);
          const inputTypeName = inflection.bulkDeleteInputType(typeName);
          const payloadTypeName = inflection.bulkDeletePayloadType(typeName);

          const inputType = build.getTypeByName(inputTypeName) as GraphQLInputType | undefined;
          const payloadType = build.getTypeByName(payloadTypeName) as GraphQLOutputType | undefined;
          if (!inputType || !payloadType) continue;

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
                  description: `Bulk delete ${typeName} rows matching the given condition.`,
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
                            'Bulk delete requires a non-empty where condition. Set bulkRequireWhere: false to allow unrestricted deletes.'
                          );
                        }

                        // Build WHERE clause from condition
                        // Supports both simple equality (Condition type: { name: "X" })
                        // and operator-based (Filter type: { name: { equalTo: "X" } })
                        const values: unknown[] = [];
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
                            'Bulk delete: no valid where conditions resolved. At least one condition is required.'
                          );
                        }

                        const whereStr = whereClauses.length > 0
                          ? whereClauses.join(' AND ')
                          : 'TRUE';

                        // Use RETURNING <pk_columns> instead of RETURNING *
                        // For delete, we capture PKs before rows are gone
                        const text = `DELETE FROM ${compiledFrom}\nWHERE ${whereStr}\nRETURNING ${pkReturning}`;
                        const mutationResult = await pgClient.query(text, values);
                        const affectedCount = mutationResult.rowCount ?? 0;

                        // For delete, rows no longer exist so we can't do a
                        // follow-up SELECT. Return the PK values directly.
                        const returning = mutationResult.rows || [];

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
            `Adding bulk delete field for ${typeName}`
          );
        }

        return fields;
      }
    }
  }
};
