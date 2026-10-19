import 'graphile-build';
import 'graphile-build-pg';

import { pgInsertSingle, type PgResource,pgUpdateSingle } from '@dataplan/pg';
import { access, lambda, object } from 'grafast';
import type { GraphileConfig } from 'graphile-config';
import { GraphQLError } from 'graphql';
import { loadModule, parseSql, parseSync } from 'plpgsql-parser';

type AstNode = Record<string, any>;

interface FieldType {
  name: string;
  schema?: string;
  args?: (number | string)[];
  array_dimensions?: number;
}

export interface FunctionDefinition {
  name: string;
  kind: 'sql' | 'plpgsql' | 'trigger';
  arguments: { name?: string; type: FieldType; mode?: string }[];
  returns: { type: FieldType; setof?: boolean } | { table: { name: string; type: FieldType }[] };
  volatility: 'IMMUTABLE' | 'STABLE' | 'VOLATILE';
  is_strict: boolean;
  security_invoker: boolean;
  body_ast: AstNode;
}

export const FUNCTION_SOURCE_PARSE_ERROR = 'FUNCTION_SOURCE_PARSE_ERROR';
export const FUNCTION_SOURCE_UNSUPPORTED = 'FUNCTION_SOURCE_UNSUPPORTED';

/** `position` is the parser's 0-based offset into the submitted source. */
const sourceError = (code: string, message: string, position?: number) =>
  new GraphQLError(message, {
    extensions: position === undefined ? { code } : { code, position }
  });

const unsupported = (message: string, position?: number) =>
  sourceError(FUNCTION_SOURCE_UNSUPPORTED, message, position);

/** Rethrows anything that is not a parser syntax error. */
const asParseError = (err: unknown, offset: number | undefined): GraphQLError => {
  const details = (err as { sqlDetails?: { message: string; cursorPosition: number } }).sqlDetails;
  if (!details) throw err;
  return sourceError(
    FUNCTION_SOURCE_PARSE_ERROR,
    details.message,
    offset === undefined ? undefined : offset + details.cursorPosition
  );
};

const sval = (node: AstNode) => node.String.sval as string;

const MODES: Record<string, string | undefined> = {
  FUNC_PARAM_DEFAULT: undefined,
  FUNC_PARAM_IN: 'in',
  FUNC_PARAM_OUT: 'out',
  FUNC_PARAM_INOUT: 'inout',
  FUNC_PARAM_VARIADIC: 'variadic'
};

const fieldType = (typeName: AstNode): FieldType => {
  if (typeName.pct_type) throw unsupported('%TYPE references are not supported', typeName.location);
  if (typeName.setof) throw unsupported('SETOF is only supported as the return type', typeName.location);
  const names = typeName.names.map(sval);
  if (names.length > 2) throw unsupported('type names take at most a schema qualifier', typeName.location);
  const name = names[names.length - 1];
  const type: FieldType = { name };
  if (names.length === 2 && names[0] !== 'pg_catalog') type.schema = names[0];
  if (typeName.typmods) {
    if (name === 'interval') throw unsupported('interval field qualifiers are not supported', typeName.location);
    type.args = typeName.typmods.map((mod: AstNode) => {
      const value = mod.A_Const?.ival?.ival ?? mod.A_Const?.sval?.sval;
      if (value === undefined) throw unsupported('type modifiers must be constants', typeName.location);
      return value;
    });
  }
  if (typeName.arrayBounds) type.array_dimensions = typeName.arrayBounds.length;
  return type;
};

/**
 * Maps one `CREATE FUNCTION` statement onto the columns `metaschema_public.function`
 * accepts. Anything those columns cannot carry is refused rather than dropped; whether
 * the definition is *allowed* is left to the database (capability gate, RLS, validator).
 * Create and update take the same text: replacing is chosen by the mutation, not the source.
 */
export const parseFunctionSource = async (source: string): Promise<FunctionDefinition> => {
  await loadModule();

  let parsed: ReturnType<typeof parseSync>;
  try {
    parsed = parseSync(source);
  } catch (err) {
    throw asParseError(err, 0);
  }

  const stmts: AstNode[] = parsed.sql.stmts ?? [];
  if (stmts.length !== 1 || !stmts[0].stmt.CreateFunctionStmt) {
    throw unsupported('source must be exactly one CREATE FUNCTION statement', stmts[1]?.stmt_location);
  }
  const stmt = stmts[0].stmt.CreateFunctionStmt as AstNode;
  if (stmt.is_procedure) throw unsupported('procedures are not supported');
  if (stmt.replace) {
    throw unsupported(
      'CREATE OR REPLACE is not supported; to replace a function, send CREATE FUNCTION to updateFunctionFromSource with its id'
    );
  }
  if (stmt.sql_body) throw unsupported('write the body as a string literal (AS $$ ... $$)');
  if (stmt.funcname.length !== 1) {
    throw unsupported('the function name must be unqualified; schemaId chooses its schema');
  }

  let language: string | undefined;
  let body: string | undefined;
  let bodyLocation: number | undefined;
  let volatility: FunctionDefinition['volatility'] = 'VOLATILE';
  let isStrict = false;
  let securityInvoker = true;
  for (const { DefElem: opt } of stmt.options ?? []) {
    switch (opt.defname) {
    case 'language':
      language = sval(opt.arg).toLowerCase();
      break;
    case 'as':
      if (opt.arg.List.items.length !== 1) throw unsupported('AS takes a single body string', opt.location);
      body = sval(opt.arg.List.items[0]);
      bodyLocation = opt.location;
      break;
    case 'volatility':
      volatility = sval(opt.arg).toUpperCase() as FunctionDefinition['volatility'];
      break;
    case 'strict':
      isStrict = Boolean(opt.arg.Boolean.boolval);
      break;
    case 'security':
      securityInvoker = !opt.arg.Boolean.boolval;
      break;
    default:
      throw unsupported(`${opt.defname.toUpperCase()} is not supported`, opt.location);
    }
  }
  if (body === undefined) throw unsupported('the function has no body (AS $$ ... $$)');

  const args: FunctionDefinition['arguments'] = [];
  const table: { name: string; type: FieldType }[] = [];
  for (const { FunctionParameter: param } of stmt.parameters ?? []) {
    if (param.defexpr) throw unsupported('argument defaults are not supported', param.location);
    if (param.mode === 'FUNC_PARAM_TABLE') {
      table.push({ name: param.name, type: fieldType(param.argType) });
      continue;
    }
    if (!(param.mode in MODES)) throw unsupported(`argument mode ${param.mode} is not supported`, param.location);
    const mode = MODES[param.mode];
    args.push({
      ...(param.name ? { name: param.name } : {}),
      type: fieldType(param.argType),
      ...(mode ? { mode } : {})
    });
  }

  const returnType = stmt.returnType as AstNode | undefined;
  if (!returnType) throw unsupported('the function must declare RETURNS');
  const returns: FunctionDefinition['returns'] = table.length
    ? { table }
    : { type: fieldType({ ...returnType, setof: false }), ...(returnType.setof ? { setof: true } : {}) };

  const common = {
    name: sval(stmt.funcname[0]),
    arguments: args,
    returns,
    volatility,
    is_strict: isStrict,
    security_invoker: securityInvoker
  };

  if (language === 'sql') {
    // Body offsets map onto the source only when the body appears verbatim (dollar-quoted).
    const bodyStart = source.indexOf(body, bodyLocation);
    let bodyAst: AstNode;
    try {
      bodyAst = parseSql(body);
    } catch (err) {
      throw asParseError(err, bodyStart < 0 ? undefined : bodyStart);
    }
    return { ...common, kind: 'sql', body_ast: bodyAst };
  }

  if (language === 'plpgsql') {
    const [bodyError] = parsed.errors;
    if (bodyError) throw sourceError(FUNCTION_SOURCE_PARSE_ERROR, bodyError.message);
    const fn = parsed.functions[0];
    const [hydrationError] = fn.plpgsql.errors;
    if (hydrationError) throw sourceError(FUNCTION_SOURCE_PARSE_ERROR, hydrationError.error);
    const kind = 'type' in returns && returns.type.name === 'trigger' ? 'trigger' : 'plpgsql';
    return { ...common, kind, body_ast: fn.plpgsql.hydrated.plpgsql_funcs[0] };
  }

  throw unsupported(`LANGUAGE ${language ?? '(none)'} is not supported; use plpgsql or sql`);
};

const isFunctionTable = (resource: PgResource<any, any, any, any, any>) => {
  const pg = resource.codec.extensions?.pg;
  return !resource.parameters && pg?.schemaName === 'metaschema_public' && pg?.name === 'function';
};

/** `updateFunctionFromSource` addresses the row the way `updateFunction` does: by `id`. */
const isIdPrimaryKey = (unique: { isPrimary?: boolean; attributes: readonly string[] }) =>
  Boolean(unique.isPrimary) && unique.attributes.length === 1 && unique.attributes[0] === 'id';

const findFunctionResource = (build: GraphileBuild.Build, behavior: 'resource:insert' | 'resource:update') =>
  Object.values(build.pgResources).find(
    (resource) =>
      isFunctionTable(resource) &&
      (behavior === 'resource:insert' || resource.uniques.some(isIdPrimaryKey)) &&
      build.behavior.pgResourceMatches(resource, behavior) === true
  );

const CREATE_INPUT = 'CreateFunctionFromSourceInput';
const UPDATE_INPUT = 'UpdateFunctionFromSourceInput';

/** The columns the source text decides; create and update write exactly these. */
const definitionColumns = ($input: any) => {
  const $definition = lambda(access($input, 'source'), (source) => parseFunctionSource(source as string));
  return {
    name: access($definition, 'name'),
    kind: access($definition, 'kind'),
    arguments: access($definition, 'arguments'),
    returns: access($definition, 'returns'),
    volatility: access($definition, 'volatility'),
    is_strict: access($definition, 'is_strict'),
    security_invoker: access($definition, 'security_invoker'),
    body_ast: access($definition, 'body_ast')
  };
};

/**
 * `createFunctionFromSource` / `updateFunctionFromSource`: author or replace a customer
 * function from SQL text. The server parses (the database never parses strings) and
 * performs the same `pgInsertSingle` / `pgUpdateSingle` as `createFunction` /
 * `updateFunction`, on the request's client under the caller's claims.
 */
export const FunctionFromSourcePlugin: GraphileConfig.Plugin = {
  name: 'FunctionFromSourcePlugin',
  version: '1.0.0',
  after: ['PgMutationCreatePlugin', 'PgMutationUpdateDeletePlugin', 'PgMutationPayloadEdgePlugin'],
  schema: {
    hooks: {
      init(_, build) {
        const { GraphQLBoolean, GraphQLNonNull, GraphQLString } = build.graphql;
        const register = (name: string, description: string, fields: (uuid: any) => Record<string, any>) =>
          build.registerInputObjectType(
            name,
            { isMutationInput: true },
            () => ({
              description,
              fields: () => ({
                clientMutationId: {
                  type: GraphQLString,
                  apply(qb: any, val: unknown) {
                    qb.setMeta('clientMutationId', val);
                  }
                },
                ...fields(build.getInputTypeByName('UUID')),
                source: {
                  type: new GraphQLNonNull(GraphQLString),
                  description: 'One `CREATE FUNCTION` statement (LANGUAGE plpgsql or sql).'
                }
              })
            }),
            'FunctionFromSourcePlugin input'
          );
        if (findFunctionResource(build, 'resource:insert')) {
          register(CREATE_INPUT, 'Author a function from its `CREATE FUNCTION` source text.', (uuid) => ({
            databaseId: { type: new GraphQLNonNull(uuid) },
            schemaId: { type: new GraphQLNonNull(uuid) },
            apiExposed: { type: GraphQLBoolean, defaultValue: false }
          }));
        }
        if (findFunctionResource(build, 'resource:update')) {
          register(
            UPDATE_INPUT,
            'Replace a function\'s definition from its `CREATE FUNCTION` source text.',
            (uuid) => ({ id: { type: new GraphQLNonNull(uuid) } })
          );
        }
        return _;
      },
      GraphQLObjectType_fields(fields, build, context) {
        if (!context.scope.isRootMutation) return fields;
        const { GraphQLNonNull } = build.graphql;
        const field = (
          fieldName: string,
          description: string,
          payloadType: string,
          inputType: string,
          plan: (fieldArgs: any) => any
        ) =>
          context.fieldWithHooks(
            { fieldName },
            {
              description,
              type: build.getOutputTypeByName(payloadType),
              args: {
                input: {
                  type: new GraphQLNonNull(build.getInputTypeByName(inputType)),
                  applyPlan(_: unknown, $mutation: unknown) {
                    return $mutation;
                  }
                }
              },
              plan(_$root: unknown, fieldArgs: any) {
                const $mutation = plan(fieldArgs);
                fieldArgs.apply($mutation);
                return object({ result: $mutation });
              }
            }
          );

        const added: Record<string, any> = {};
        const insertable = findFunctionResource(build, 'resource:insert');
        if (insertable) {
          added.createFunctionFromSource = field(
            'createFunctionFromSource',
            'Creates a `Function` from its `CREATE FUNCTION` source text.',
            build.inflection.createPayloadType(insertable),
            CREATE_INPUT,
            (fieldArgs) => {
              const $input = fieldArgs.getRaw('input');
              return pgInsertSingle(insertable, {
                database_id: access($input, 'databaseId'),
                schema_id: access($input, 'schemaId'),
                api_exposed: access($input, 'apiExposed'),
                ...definitionColumns($input)
              });
            }
          );
        }
        const updatable = findFunctionResource(build, 'resource:update');
        if (updatable) {
          added.updateFunctionFromSource = field(
            'updateFunctionFromSource',
            'Replaces a `Function`\'s definition from its source text; its database, schema and exposure are unchanged.',
            build.inflection.updatePayloadType({ resource: updatable }),
            UPDATE_INPUT,
            (fieldArgs) => {
              const $input = fieldArgs.getRaw('input');
              return pgUpdateSingle(updatable, { id: access($input, 'id') }, definitionColumns($input));
            }
          );
        }
        return build.extend(fields, added, 'Adding FunctionFromSource mutations');
      }
    }
  }
};

export const FunctionFromSourcePreset: GraphileConfig.Preset = {
  plugins: [FunctionFromSourcePlugin]
};
