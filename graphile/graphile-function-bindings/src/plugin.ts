/**
 * PostGraphile v5 Function Bindings Plugin
 *
 * Exposes API-bound compute functions as GraphQL mutations. At gather time
 * the plugin queries the bindings table joined to the definitions table
 * (schema/table names resolved from the constructive metaschema via the
 * express-context compute module loader — never guessed or hard-coded)
 * for the configured api_id and emits one mutation per graphql-enabled
 * binding:
 *
 *   <alias>(input: <Alias>Input!): <Alias>Payload
 *
 * The input type is derived from the function's payload metadata (JSON Schema
 * on the binding config, else payload_args, else a raw `payload: JSON`
 * field — see derive.ts). The payload returns the created invocation row
 * (id/status), reusing the FunctionInvocation type when the table is exposed.
 *
 * Invoking = a plain, RLS-enforced INSERT into function_invocations on the
 * normal authenticated connection. pgSettings (including jwt.claims.api_id
 * provenance) are supplied by the server layer — this plugin never sets
 * claims or bypasses RLS. No runtime payload validation is performed.
 *
 * Bindings are loaded once per schema build (gather phase). New or changed
 * bindings appear after the next schema rebuild — the server's existing
 * schema cache invalidation (LISTEN/NOTIFY via graphile-cache) or a restart.
 * TODO: emit a cache invalidation NOTIFY on function_api_bindings changes so
 * rebuilds happen automatically.
 */

import 'graphile-build';
import 'graphile-build-pg';

import { QueryBuilder, type SqlValue } from '@constructive-io/query-builder';
import { withPgClientFromPgService } from '@dataplan/pg';
import { Logger } from '@pgpmjs/logger';
import { access, context as grafastContext, lambda, object } from 'grafast';
import type { GraphileConfig } from 'graphile-config';
import { isValidNameError } from 'graphql';
import { toCamelCase, toConstantCase, toPascalCase } from 'inflekt';

import type { DerivedField, DerivedInput } from './derive';
import { buildInvocationPayload, deriveInputFields, isGraphqlEnabled } from './derive';
import type { ComputeModuleNames, FunctionBindingRow, FunctionBindingsPluginOptions } from './types';

const log = new Logger('graphile-function-bindings');

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace GraphileConfig {
    interface Plugins {
      FunctionBindingsPlugin: true;
    }
    interface GatherHelpers {
      functionBindings: Record<string, never>;
    }
  }
}

/** A binding together with the module (scope) it was loaded from. */
interface LoadedBinding extends FunctionBindingRow {
  module: ComputeModuleNames;
}

interface FunctionBindingsBuildInput {
  bindings: LoadedBinding[];
}

async function loadBindings(
  pgService: GraphileConfig.PgServiceConfiguration,
  options: FunctionBindingsPluginOptions
): Promise<FunctionBindingsBuildInput> {
  return withPgClientFromPgService(pgService, null, async (client) => {
    const bindings: LoadedBinding[] = [];
    for (const module of options.modules) {
      const { computeSchema, bindingsTable, definitionsTable } = module;
      const { text, values } = new QueryBuilder()
        .schema(computeSchema)
        .table(bindingsTable, 'b')
        .select([
          'b.id',
          'b.alias',
          'b.config',
          'b.function_definition_id',
          'd.task_identifier',
          'd.description',
          'd.payload_args'
        ])
        .innerJoin(definitionsTable, 'b.function_definition_id', '=', 'd.id', {
          schema: computeSchema,
          alias: 'd'
        })
        .where({ 'b.api_id': { equalTo: options.apiId } })
        .orderBy('b.alias', 'ASC')
        .build();
      const { rows } = await client.query<{
        id: string;
        alias: string;
        config: Record<string, unknown> | null;
        function_definition_id: string;
        task_identifier: string;
        description: string | null;
        payload_args: FunctionBindingRow['payloadArgs'];
      }>({ text, values });

      for (const row of rows) {
        if (!isGraphqlEnabled(row.config)) continue;
        bindings.push({
          bindingId: row.id,
          alias: row.alias,
          config: row.config,
          functionDefinitionId: row.function_definition_id,
          taskIdentifier: row.task_identifier,
          description: row.description,
          payloadArgs: row.payload_args,
          module
        });
      }
    }

    return { bindings };
  });
}

export function createFunctionBindingsPlugin(
  options: FunctionBindingsPluginOptions
): GraphileConfig.Plugin {
  return {
    name: 'FunctionBindingsPlugin',
    version: '0.1.0',
    description:
      'Exposes API-bound compute functions as GraphQL mutations backed by RLS-enforced function_invocations inserts',

    after: ['PgTablesPlugin', 'PgMutationCreatePlugin'],

    gather: {
      namespace: 'functionBindings',
      helpers: {},
      async main(output, info) {
        const pgService = info.resolvedPreset.pgServices?.[0];
        if (!pgService) {
          throw new Error('FunctionBindingsPlugin: no pgService configured');
        }
        if (!options.apiId) {
          throw new Error('FunctionBindingsPlugin: apiId is required');
        }
        if (!options.modules?.length) {
          throw new Error('FunctionBindingsPlugin: at least one compute module is required');
        }
        const result = await loadBindings(pgService, options);
        (output as Record<string, unknown>).functionApiBindings = result;
        log.debug(
          `Loaded ${result.bindings.length} graphql-enabled function binding(s) for api ${options.apiId}`
        );
      }
    },

    schema: {
      hooks: {
        GraphQLObjectType_fields(fields, build, context) {
          const { scope, fieldWithHooks } = context;
          if (!scope.isRootMutation) return fields;

          const loaded = (build.input as unknown as Record<string, unknown>)
            .functionApiBindings as FunctionBindingsBuildInput | undefined;
          if (!loaded || loaded.bindings.length === 0) return fields;

          const {
            graphql: {
              GraphQLString,
              GraphQLNonNull,
              GraphQLObjectType,
              GraphQLInputObjectType,
              GraphQLEnumType,
              GraphQLList
            }
          } = build;

          const namedType = (name: string) => {
            try {
              return build.getTypeByName(name) ?? GraphQLString;
            } catch {
              return GraphQLString;
            }
          };

          const findInvocationsResource = (module: ComputeModuleNames) =>
            Object.values(
              (build.input.pgRegistry?.pgResources ?? {}) as Record<string, any>
            ).find(
              (resource: any) =>
                resource?.codec?.extensions?.pg?.name === module.invocationsTable &&
                resource?.codec?.extensions?.pg?.schemaName === module.invocationsSchema &&
                !resource.parameters
            );

          const newFields: Record<string, any> = {};

          for (const binding of loaded.bindings) {
            if (isValidNameError(toCamelCase(binding.alias))) {
              log.warn(`Skipping binding "${binding.alias}": alias is not a valid GraphQL name`);
              continue;
            }
            const fieldName = toCamelCase(binding.alias);
            const typePrefix = toPascalCase(binding.alias);
            if (fields[fieldName] || newFields[fieldName]) {
              log.warn(`Skipping binding "${binding.alias}": mutation field "${fieldName}" already exists`);
              continue;
            }

            const invocationsResource = findInvocationsResource(binding.module);
            const invocationType = invocationsResource
              ? (build.getGraphQLTypeByPgCodec?.(invocationsResource.codec, 'output') as
                  | import('graphql').GraphQLObjectType
                  | undefined)
              : undefined;

            const derived: DerivedInput = deriveInputFields(binding);

            const inputFieldConfig = (field: DerivedField) => {
              let type: import('graphql').GraphQLInputType;
              if (field.enumValues) {
                type = new GraphQLEnumType({
                  name: `${typePrefix}${toPascalCase(field.name)}Enum`,
                  values: Object.fromEntries(
                    field.enumValues.map((v) => [toConstantCase(v), { value: v }])
                  )
                });
              } else {
                type = namedType(field.scalar) as import('graphql').GraphQLInputType;
              }
              if (field.list) {
                type = new GraphQLList(new GraphQLNonNull(type));
              }
              if (field.required) {
                type = new GraphQLNonNull(type);
              }
              return {
                type,
                ...(field.description ? { description: field.description } : {})
              };
            };

            const InputType = new GraphQLInputObjectType({
              name: `${typePrefix}Input`,
              fields: {
                clientMutationId: { type: GraphQLString },
                ...Object.fromEntries(
                  derived.fields.map((field) => [field.name, inputFieldConfig(field)])
                )
              }
            });

            const capturedBinding = binding;
            const capturedDerived = derived;
            const capturedInvocationsSchema = binding.module.invocationsSchema;
            const capturedInvocationsTable = binding.module.invocationsTable;
            const capturedInvocationsEntityField = binding.module.invocationsEntityField;
            const capturedResource = invocationsResource;

            const PayloadType = new GraphQLObjectType({
              name: `${typePrefix}Payload`,
              fields: {
                clientMutationId: { type: GraphQLString },
                invocationId: {
                  type: namedType('UUID') as import('graphql').GraphQLOutputType
                },
                status: { type: GraphQLString },
                ...(invocationType && capturedResource
                  ? {
                    invocation: {
                      type: invocationType,
                      description: 'The created function invocation',
                      extensions: {
                        grafast: {
                          plan($payload: any) {
                            const $id = access($payload, 'invocationId');
                            return capturedResource.get({ id: $id });
                          }
                        }
                      }
                    }
                  }
                  : {})
              }
            });

            log.debug(`Adding function binding mutation "${fieldName}" (${binding.taskIdentifier})`);

            newFields[fieldName] = fieldWithHooks(
              { fieldName } as any,
              {
                description:
                  binding.description ??
                  `Invoke the "${binding.alias}" function (${binding.taskIdentifier})`,
                type: PayloadType,
                args: {
                  input: { type: new GraphQLNonNull(InputType) }
                },
                plan(_$mutation: any, fieldArgs: any) {
                  const $input = fieldArgs.getRaw('input');
                  const inputSteps: Record<string, any> = {
                    clientMutationId: access($input, 'clientMutationId')
                  };
                  for (const field of capturedDerived.fields) {
                    inputSteps[field.name] = access($input, field.name);
                  }
                  const $withPgClient = (grafastContext() as any).get('withPgClient');
                  const $pgSettings = (grafastContext() as any).get('pgSettings');

                  const $combined = object({
                    ...inputSteps,
                    withPgClient: $withPgClient,
                    pgSettings: $pgSettings
                  });

                  const $result = lambda($combined, async (vals: any) => {
                    const { withPgClient, pgSettings, clientMutationId, ...input } = vals;
                    const payload = buildInvocationPayload(capturedDerived, input);
                    // API-channel provenance: set both the definition and the
                    // binding the invocation came through, at status 'pending'.
                    // The database's AFTER INSERT enqueue trigger schedules the
                    // job — the plugin never enqueues.
                    const insertData: Record<string, SqlValue> = {
                      task_identifier: capturedBinding.taskIdentifier,
                      function_definition_id: capturedBinding.functionDefinitionId,
                      api_binding_id: capturedBinding.bindingId,
                      status: 'pending',
                      payload: payload === null ? null : JSON.stringify(payload)
                    };
                    // Scope-key column driven by the module's recorded
                    // entity_field: set for the database scope (database_id
                    // from the request's jwt claim), absent for global scopes.
                    if (capturedInvocationsEntityField) {
                      const dbId = pgSettings?.['jwt.claims.database_id'];
                      insertData[capturedInvocationsEntityField] = dbId ? dbId : null;
                    }
                    const { text, values } = new QueryBuilder()
                      .schema(capturedInvocationsSchema)
                      .table(capturedInvocationsTable)
                      .insert(insertData)
                      .returning(['id', 'status'])
                      .build();
                    return withPgClient(pgSettings, async (pgClient: any) => {
                      const { rows } = await pgClient.query({ text, values });
                      const row = rows[0];
                      return {
                        clientMutationId: clientMutationId ?? null,
                        invocationId: row.id,
                        status: row.status
                      };
                    });
                  });
                  // The insert is a side effect — grafast must not dedupe,
                  // reorder, or defer it relative to dependent output plans.
                  ($result as any).hasSideEffects = true;
                  return $result;
                }
              }
            );
          }

          if (Object.keys(newFields).length === 0) return fields;

          return build.extend(fields, newFields, 'Adding function binding mutations');
        }
      }
    }
  };
}
