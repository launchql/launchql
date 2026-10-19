import { pgInsertSingle, type PgResource } from '@dataplan/pg';
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
  if (stmt.replace) throw unsupported('CREATE OR REPLACE is not supported; this creates a new function');
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

const findFunctionResource = (build: GraphileBuild.Build) =>
  Object.values(build.pgResources).find(
    (resource) =>
      isFunctionTable(resource) && build.behavior.pgResourceMatches(resource, 'resource:insert') === true
  );

const INPUT_TYPE = 'CreateFunctionFromSourceInput';

/**
 * `createFunctionFromSource`: author a customer function from SQL text. The server parses
 * (the database never parses strings) and performs the same `pgInsertSingle` as
 * `createFunction`, on the request's client under the caller's claims.
 */
export const FunctionFromSourcePlugin: GraphileConfig.Plugin = {
  name: 'FunctionFromSourcePlugin',
  version: '1.0.0',
  after: ['PgMutationCreatePlugin', 'PgMutationPayloadEdgePlugin'],
  schema: {
    hooks: {
      init(_, build) {
        if (!findFunctionResource(build)) return _;
        const { GraphQLBoolean, GraphQLNonNull, GraphQLString } = build.graphql;
        build.registerInputObjectType(
          INPUT_TYPE,
          { isMutationInput: true },
          () => ({
            description: 'Author a function from its `CREATE FUNCTION` source text.',
            fields: () => {
              const uuid = build.getInputTypeByName('UUID');
              return {
                clientMutationId: {
                  type: GraphQLString,
                  apply(qb: any, val: unknown) {
                    qb.setMeta('clientMutationId', val);
                  }
                },
                databaseId: { type: new GraphQLNonNull(uuid) },
                schemaId: { type: new GraphQLNonNull(uuid) },
                source: {
                  type: new GraphQLNonNull(GraphQLString),
                  description: 'One `CREATE FUNCTION` statement (LANGUAGE plpgsql or sql).'
                },
                apiExposed: { type: GraphQLBoolean, defaultValue: false }
              };
            }
          }),
          'FunctionFromSourcePlugin input'
        );
        return _;
      },
      GraphQLObjectType_fields(fields, build, context) {
        if (!context.scope.isRootMutation) return fields;
        const resource = findFunctionResource(build);
        if (!resource) return fields;
        const { GraphQLNonNull } = build.graphql;
        return build.extend(
          fields,
          {
            createFunctionFromSource: context.fieldWithHooks(
              { fieldName: 'createFunctionFromSource' },
              {
                description: 'Creates a `Function` from its `CREATE FUNCTION` source text.',
                type: build.getOutputTypeByName(build.inflection.createPayloadType(resource)),
                args: {
                  input: {
                    type: new GraphQLNonNull(build.getInputTypeByName(INPUT_TYPE)),
                    applyPlan(_: unknown, $insert: unknown) {
                      return $insert;
                    }
                  }
                },
                plan(_$root: unknown, fieldArgs: any) {
                  const $input = fieldArgs.getRaw('input');
                  const $definition = lambda(access($input, 'source'), (source) =>
                    parseFunctionSource(source as string)
                  );
                  const $insert = pgInsertSingle(resource, {
                    database_id: access($input, 'databaseId'),
                    schema_id: access($input, 'schemaId'),
                    api_exposed: access($input, 'apiExposed'),
                    name: access($definition, 'name'),
                    kind: access($definition, 'kind'),
                    arguments: access($definition, 'arguments'),
                    returns: access($definition, 'returns'),
                    volatility: access($definition, 'volatility'),
                    is_strict: access($definition, 'is_strict'),
                    security_invoker: access($definition, 'security_invoker'),
                    body_ast: access($definition, 'body_ast')
                  });
                  fieldArgs.apply($insert);
                  return object({ result: $insert });
                }
              }
            )
          },
          'Adding createFunctionFromSource mutation'
        );
      }
    }
  }
};

export const FunctionFromSourcePreset: GraphileConfig.Preset = {
  plugins: [FunctionFromSourcePlugin]
};
